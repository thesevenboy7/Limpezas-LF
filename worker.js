/**
 * Cloudflare Worker — LF Services · Painel de Limpezas
 *
 * Env vars necessárias (configurar em Workers > Settings > Variables):
 *   NOTION_TOKEN    — "secret_xxxx" (Bearer token da integração Notion)
 *   NOTION_VERSION  — "2022-06-28" (ou versão mais recente)
 *   R2_PUBLIC_URL   — URL pública do bucket R2, sem barra final (ex: https://pub.r2.dev/fotos-lf)
 *   MASTER_CODE     — código master exibido para supervisor/admin em GET /kv/senhas?master=1
 *   PINS            — JSON string com PINs por nome: { "mireyda": "1234", "inosencia": "5678", ... }
 *
 * Bindings necessários (configurar em Workers > Settings > Bindings):
 *   FOTOS — R2 bucket
 *   KV    — KV namespace
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Notion-Version',
};

const KV_TTL        = 60 * 60 * 24 * 30;  // 30 dias
const KV_TTL_SENHAS = 60 * 60 * 24 * 365; // 365 dias

const ROLES_ADMIN = new Set(['supervisor', 'admin']);

const VALID_STATUS = new Set(['pendente', 'aguardando', 'aprovada', 'rejeitada']);

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/health') return json({ ok: true });

      if (path === '/upload' && request.method === 'POST')
        return handleUpload(request, env);

      if (path === '/kv/status') {
        if (request.method === 'GET') return handleKvGet(url, env, 'status');
        if (request.method === 'POST') return handleKvStatusPost(request, env);
      }

      if (path === '/auth/pin' && request.method === 'POST')
        return handleAuthPin(request, env);

      if (path === '/kv/senhas') {
        if (request.method === 'GET') return handleKvSenhasGet(request, env, url);
        if (request.method === 'POST') return handleKvSenhasPost(request, env);
      }

      if (path === '/kv/senhas/bulk' && request.method === 'POST')
        return handleKvSenhasBulk(request, env);

      if (path === '/kv/atribuicoes') {
        if (request.method === 'GET') return handleKvGet(url, env, 'atribuicoes');
        if (request.method === 'POST') return handleKvAtribuicoesPost(request, env);
      }

      if (path.startsWith('/v1/')) return handleNotion(request, env, url);

      return err('Not found', 404);
    } catch (e) {
      return err(e.message ?? 'Internal error', 500);
    }
  },
};

// --- Upload R2 ---

async function handleUpload(request, env) {
  const form = await request.formData();
  const foto = form.get('foto');
  const funcionaria = form.get('funcionaria');
  const unidade = form.get('unidade');
  const data = form.get('data');

  if (!foto || !funcionaria || !unidade || !data)
    return err('Campos obrigatórios: foto, funcionaria, unidade, data', 400);

  const ext = foto.name?.split('.').pop()?.toLowerCase() || 'jpg';
  const ts = Date.now();
  const key = `fotos/${data}/${funcionaria}/${unidade}_${ts}.${ext}`;

  const buffer = await foto.arrayBuffer();
  await env.FOTOS.put(key, buffer, {
    httpMetadata: { contentType: foto.type || 'image/jpeg' },
  });

  const publicUrl = env.R2_PUBLIC_URL;
  return json({ url: `${publicUrl}/${key}`, key });
}

// --- KV GET genérico ---

async function handleKvGet(url, env, prefix) {
  const data = url.searchParams.get('data');
  if (!data) return err('Param data obrigatório', 400);
  const raw = await env.KV.get(`${prefix}:${data}`, 'json');
  return json(raw ?? {});
}

// --- KV POST status ---

async function handleKvStatusPost(request, env) {
  const body = await request.json();
  const { data, unidade, status, funcionaria, fotoUrl, comentario, lat, lng, timestamp } = body;

  if (!data || !unidade || !status || !funcionaria)
    return err('Campos obrigatórios: data, unidade, status, funcionaria', 400);

  if (!VALID_STATUS.has(status))
    return err(`Status inválido. Use: ${[...VALID_STATUS].join(' | ')}`, 400);

  const key = `status:${data}`;
  const existing = (await env.KV.get(key, 'json')) ?? {};

  existing[unidade] = {
    status,
    funcionaria,
    ...(fotoUrl !== undefined && { fotoUrl }),
    ...(comentario !== undefined && { comentario }),
    ...(lat !== undefined && { lat }),
    ...(lng !== undefined && { lng }),
    ...(timestamp !== undefined && { timestamp }),
  };

  await env.KV.put(key, JSON.stringify(existing), { expirationTtl: KV_TTL });
  return json({ ok: true, key, unidade });
}

// --- KV POST atribuicoes ---
// Merge por chave: _unidades (Google Script) e atribuições por funcionária (admin) coexistem.
// Enviar só _unidades preserva atribuições por nome; enviar só nome preserva _unidades.

async function handleKvAtribuicoesPost(request, env) {
  const body = await request.json();
  const { data, atribuicoes } = body;

  if (!data || !atribuicoes || typeof atribuicoes !== 'object')
    return err('Campos obrigatórios: data, atribuicoes (objeto { nome: [unidades] | "_unidades": {...} })', 400);

  const key = `atribuicoes:${data}`;
  const existing = (await env.KV.get(key, 'json')) ?? {};

  // Merge chave a chave: cada chamada só sobrescreve as chaves que envia.
  // _unidades vindo do Google Script não apaga { "mireyda": [...] } e vice-versa.
  const merged = { ...existing, ...atribuicoes };

  await env.KV.put(key, JSON.stringify(merged), { expirationTtl: KV_TTL });
  return json({ ok: true, key, chaves: Object.keys(merged).length });
}

// --- Auth PIN ---

async function handleAuthPin(request, env) {
  const body = await request.json();
  const { nome, pin, role } = body;

  if (!nome || !pin || !role)
    return err('Campos obrigatórios: nome, pin, role', 400);

  let pins = {};
  try { pins = JSON.parse(env.PINS || '{}'); } catch { return err('Erro interno ao carregar PINs', 500); }

  if (pins[nome.toLowerCase()] !== String(pin))
    return err('Credenciais inválidas', 401);

  return json({ ok: true, nome, role, autenticadaEm: new Date().toISOString() });
}

// --- KV Senhas ---

async function handleKvSenhasGet(request, env, url) {
  const data = await env.KV.get('senhas:unidades', 'json') ?? {};
  const role = request.headers.get('X-Role') ?? '';
  if (url.searchParams.get('master') === '1' && ROLES_ADMIN.has(role)) {
    data.masterCode = env.MASTER_CODE ?? '';
  }
  return json(data);
}

async function handleKvSenhasPost(request, env) {
  const role = request.headers.get('X-Role') ?? '';
  if (!ROLES_ADMIN.has(role)) return err('Acesso negado', 403);

  const body = await request.json();
  const { unidade, senha } = body;
  if (!unidade || senha === undefined) return err('Campos obrigatórios: unidade, senha', 400);

  const existing = (await env.KV.get('senhas:unidades', 'json')) ?? {};
  existing[unidade] = { senha, updatedAt: new Date().toISOString() };
  await env.KV.put('senhas:unidades', JSON.stringify(existing), { expirationTtl: KV_TTL_SENHAS });
  return json({ ok: true, unidade });
}

async function handleKvSenhasBulk(request, env) {
  const role = request.headers.get('X-Role') ?? '';
  if (!ROLES_ADMIN.has(role)) return err('Acesso negado', 403);

  const body = await request.json();
  const { senhas } = body;
  if (!senhas || typeof senhas !== 'object') return err('Campo obrigatório: senhas (objeto { unidade: senha })', 400);

  const existing = (await env.KV.get('senhas:unidades', 'json')) ?? {};
  const now = new Date().toISOString();
  for (const [unidade, senha] of Object.entries(senhas)) {
    existing[unidade] = { senha, updatedAt: now };
  }
  await env.KV.put('senhas:unidades', JSON.stringify(existing), { expirationTtl: KV_TTL_SENHAS });
  return json({ ok: true, count: Object.keys(senhas).length });
}

// --- Proxy Notion ---

async function handleNotion(request, env, url) {
  const notionUrl = `https://api.notion.com${url.pathname}${url.search}`;

  const headers = {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': env.NOTION_VERSION ?? '2022-06-28',
  };

  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  let res;
  try {
    res = await fetch(notionUrl, { method: request.method, headers, body });
  } catch (e) {
    return err(`Falha ao contatar Notion API: ${e.message}`, 502);
  }

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// --- Helpers ---

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
