/**
 * Cloudflare Worker — Proxy CORS para Notion API
 * LF Services · Painel de Limpezas
 *
 * DEPLOY:
 *   1. Acesse https://workers.cloudflare.com (conta grátis)
 *   2. Clique em "Create a Worker"
 *   3. Apague o código de exemplo e cole este arquivo inteiro
 *   4. Clique em "Deploy"
 *   5. Copie a URL gerada (ex: https://lf-notion.seu-usuario.workers.dev)
 *   6. Cole essa URL no campo "URL do Cloudflare Worker" no painel de limpezas
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Notion-Version',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Responde preflight CORS imediatamente
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  // Monta a URL final na Notion API
  const notionUrl = `https://api.notion.com${url.pathname}${url.search}`;

  // Repassa apenas os headers necessários para a Notion API
  const headers = {
    'Authorization':  request.headers.get('Authorization') || '',
    'Content-Type':   'application/json',
    'Notion-Version': request.headers.get('Notion-Version') || '2022-06-28',
  };

  // Lê o body para métodos que o possuem
  const body = (request.method === 'GET' || request.method === 'HEAD')
    ? undefined
    : await request.text();

  let notionResponse;
  try {
    notionResponse = await fetch(notionUrl, { method: request.method, headers, body });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Worker: falha ao contatar Notion API', detail: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const responseText = await notionResponse.text();

  return new Response(responseText, {
    status: notionResponse.status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
