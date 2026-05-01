var BOT_TOKEN  = "8716853579:AAFOeGfcCtVP90z4mrvtb9-QSmrJ6LF6HXI";
var CHAT_ID    = "7838431238";
var WORKER_URL = "https://lyrios-cleaning-worker.mariopimentel1610.workers.dev";

var UNIDADES = [
  // LEGACY
  { nome: "105", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/48565408.ics?t=ff009cb2891b4063bc0fde0f00a4ee60" },
  { nome: "107", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/915802216199211267.ics?t=a3b8c57461204170a8ab9e754d77442a" },
  { nome: "144", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1210042738584719098.ics?t=1b3675b2dcf84cb197328aefee77593b" },
  { nome: "161", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/52584100.ics?t=d71f3e0b048e4a03bad0525a9fa85cba" },
  { nome: "162", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1210050077263009327.ics?t=4d29f9ac50374eb6aac7690bb1c6e404" },
  { nome: "163", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/54271713.ics?t=03c06196e7fd45fdad33cd448702bcf6" },
  { nome: "166", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1153735831102365573.ics?t=f3232c1e95d74fd0a2f84b796a3d2fbc" },
  { nome: "187", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1092044668622483292.ics?t=b1fd1fa407f348acab9c5ede7a822adb" },
  { nome: "189", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1154231403922270714.ics?t=196b547bdae843cd8546d46003508aa6" },
  { nome: "195", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/52456571.ics?t=1a8b975a2c674243a3574f8e8b58e79e" },
  { nome: "199", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1134694051593220860.ics?t=89bbaf9ef36e4fe2be040c1409bf5711" },
  { nome: "205", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/52456694.ics?t=78962e232bde4825b6e5b1f719082c60" },
  { nome: "207", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/925984756640620961.ics?t=ba1b0e9e3527442595415bf8b2f5e11b" },
  { nome: "213", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/876192507802439067.ics?t=6afba10e5075477281113eda6faabeb9" },
  { nome: "243", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/52536006.ics?t=2989cce471294e3d88afa4a4e5d9105a" },
  { nome: "271", local: "Legacy", ical: "https://www.airbnb.com.br/calendar/ical/1118186066805410172.ics?t=c2ff3feab322418e9010c2acea4e4ff8" },

  // THE VILLAS
  { nome: "22",     local: "The Villas", ical: "https://www.airbnb.com.br/calendar/ical/1293057168362925096.ics?t=72aa1f2aa6304ca7bab319c63718c194" },
  { nome: "113 Q1", local: "The Villas", ical: "https://www.airbnb.com.br/calendar/ical/1132473389451104163.ics?t=8bb25527a0ec4ee081a0dd7f1e2d1238" },
  { nome: "113 Q2", local: "The Villas", ical: "https://www.airbnb.com.br/calendar/ical/1593536754724936921.ics?t=d84221a7ed07467091b5c7607cb6b20f" },

  // DAVENPORT
  { nome: "8927", local: "Davenport", ical: "https://www.airbnb.com.br/calendar/ical/1596684225443799036.ics?t=ae56ca880dda4125a6c7e5353ca2954e" },

  // THE PALMS
  { nome: "320", local: "The Palms", ical: "https://www.airbnb.com.br/calendar/ical/1125475561525796072.ics?t=183cc9171cb34b37b611e5b555b3da98" },
  { nome: "325", local: "The Palms", ical: "https://www.airbnb.com.br/calendar/ical/53058767.ics?t=5d95d34abce14528a761c99661bc3478" },
  { nome: "622", local: "The Palms", ical: "https://www.airbnb.com.br/calendar/ical/1176218846392966308.ics?t=34fc5d7cf6d1406f96c75df86f07a6d9" },
  { nome: "627", local: "The Palms", ical: "https://www.airbnb.com.br/calendar/ical/1138295273884009731.ics?t=bb781b7c799342129e1682f90c741fed" },
  { nome: "743", local: "The Palms", ical: "https://www.airbnb.com.br/calendar/ical/1665417839201545133.ics?t=3020f23f23af4ba98f66b68b11edef0f" }
];

var LOCAIS_ORDEM = ["Legacy", "The Villas", "Davenport", "The Palms"];

var LOCAIS_EMOJI = {
  "Legacy":     "🏢",
  "The Villas": "🏡",
  "Davenport":  "🌴",
  "The Palms":  "🌴"
};

// ─── FUNÇÕES PRINCIPAIS ───────────────────────────────────────────────────────

function enviarCheckinsDoDia() {
  var datas = getDatasOrlando(new Date(), 0);
  processarEEnviar(datas.hoje, datas.ontem, datas.dataFormatada);
}

function testarDia16() {
  processarEEnviar("20260416", "20260415", "16/04/2026");
}

function testarDia15() {
  processarEEnviar("20260415", "20260414", "15/04/2026");
}

// ─── ENGINE PRINCIPAL ─────────────────────────────────────────────────────────

function processarEEnviar(hoje, ontem, dataFormatada) {
  var resultado = {};
  LOCAIS_ORDEM.forEach(function(local) {
    resultado[local] = { limpeza: [], privada: [] };
  });
  var refrescar = [];
  var erros = [];

  UNIDADES.forEach(function(unidade) {
    try {
      var response = UrlFetchApp.fetch(unidade.ical, { muteHttpExceptions: true });
      if (response.getResponseCode() !== 200) { erros.push(unidade.nome); return; }

      var eventos = parseIcal(response.getContentText());
      var local = unidade.local;

      var checkoutHoje = false;
      var checkinHoje  = false;
      var ocupadoOntem = false;
      var isPrivada    = false;

      eventos.forEach(function(ev) {
        var summary = (ev.summary || "").toLowerCase();

        var bloqueioGenerico = (
          summary === "" ||
          summary.indexOf("blocked") !== -1 ||
          summary.indexOf("not available") !== -1
        );
        var privada = (
          summary.indexOf("reserva privada") !== -1 ||
          summary.indexOf("private") !== -1
        );
        if (bloqueioGenerico && !privada) return;

        if (ev.dtend === hoje) {
          checkoutHoje = true;
          if (privada) isPrivada = true;
        }

        if (ev.dtstart === hoje) {
          checkinHoje = true;
          if (privada) isPrivada = true;
        }

        if (ev.dtstart <= ontem && ev.dtend > ontem) {
          ocupadoOntem = true;
        }
      });

      if (checkoutHoje) {
        if (isPrivada) {
          resultado[local].privada.push(unidade.nome);
        } else {
          resultado[local].limpeza.push(unidade.nome);
        }
      } else if (checkinHoje && !ocupadoOntem) {
        refrescar.push(unidade.nome);
      }

    } catch (e) {
      erros.push(unidade.nome);
    }
  });

  // ── Montar mensagem ──────────────────────────────────────────────────────
  var msg = "🌅 Buenos días — " + dataFormatada + "\n";
  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

  var temLimpeza = false;

  LOCAIS_ORDEM.forEach(function(local) {
    var d = resultado[local];
    if (d.limpeza.length + d.privada.length === 0) return;
    temLimpeza = true;
    msg += LOCAIS_EMOJI[local] + " *" + local.toUpperCase() + "*\n";
    d.limpeza.forEach(function(apt) { msg += "🧹 Apt " + apt + "\n"; });
    d.privada.forEach(function(apt) { msg += "🧹 Apt " + apt + " 🔒\n"; });
    msg += "\n";
  });

  if (!temLimpeza && refrescar.length === 0) {
    msg += "✅ Nenhuma limpeza hoje.\n\n";
  }

  if (refrescar.length > 0) {
    msg += "━━━━━━━━━━━━━━━━━━━━\n";
    msg += "🌿 *REFRESCAR*\n";
    msg += refrescar.map(function(n) { return "Apt " + n; }).join(", ") + "\n";
  }

  if (erros.length > 0) {
    msg += "\n⚠️ Erro ao ler: " + erros.join(", ");
  }

  // ── Sincronizar unidades com Worker ─────────────────────────────────────
  var avisoSync = enviarParaWorker(resultado, refrescar, hoje);
  if (avisoSync) msg += "\n" + avisoSync;

  enviarTelegram(msg);
}

// ─── WORKER SYNC ──────────────────────────────────────────────────────────────

function enviarParaWorker(resultado, refrescar, hoje) {
  // hoje vem no formato yyyyMMdd — Worker espera YYYY-MM-DD
  var hojeISO = hoje.substring(0, 4) + "-" + hoje.substring(4, 6) + "-" + hoje.substring(6, 8);

  var unidades = {};

  // limpeza e privada: iterar por local
  LOCAIS_ORDEM.forEach(function(local) {
    var bloco = resultado[local] || {};
    (bloco.limpeza || []).forEach(function(u) {
      unidades[String(u)] = { local: local, tipo: "limpeza" };
    });
    (bloco.privada || []).forEach(function(u) {
      unidades[String(u)] = { local: local, tipo: "privada" };
    });
  });

  // refrescar: buscar local no array UNIDADES para preservar a info
  refrescar.forEach(function(u) {
    var info = UNIDADES.filter(function(x) { return x.nome === u; })[0];
    unidades[String(u)] = { local: info ? info.local : "", tipo: "refrescar" };
  });

  try {
    UrlFetchApp.fetch(WORKER_URL + "/kv/atribuicoes", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ data: hojeISO, atribuicoes: { "_unidades": unidades } }),
      muteHttpExceptions: true
    });
    return "";
  } catch (e) {
    return "⚠️ Falha ao sincronizar com sistema";
  }
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function getDatasOrlando(agora, offsetDias) {
  var offset = getOrlandoOffset(agora);
  var orlandoTime = new Date(agora.getTime() + (offset * 60 * 60 * 1000));
  if (offsetDias !== 0) {
    orlandoTime = new Date(orlandoTime.getTime() + (offsetDias * 24 * 60 * 60 * 1000));
  }
  var hoje  = Utilities.formatDate(orlandoTime, "UTC", "yyyyMMdd");
  var ontemDate = new Date(orlandoTime.getTime() - (24 * 60 * 60 * 1000));
  var ontem = Utilities.formatDate(ontemDate, "UTC", "yyyyMMdd");
  var dataFormatada = Utilities.formatDate(orlandoTime, "UTC", "dd/MM/yyyy");
  return { hoje: hoje, ontem: ontem, dataFormatada: dataFormatada };
}

function enviarTelegram(texto) {
  var url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: CHAT_ID, text: texto, parse_mode: "Markdown" })
  });
}

function parseIcal(data) {
  var eventos = [];
  var linhas = data.split("\n");
  var evento = null;

  linhas.forEach(function(linha) {
    linha = linha.trim();
    if (linha === "BEGIN:VEVENT") {
      evento = {};
    } else if (linha === "END:VEVENT") {
      if (evento) eventos.push(evento);
      evento = null;
    } else if (evento) {
      if (linha.startsWith("DTSTART")) {
        evento.dtstart = linha.split(":").pop().substring(0, 8);
      } else if (linha.startsWith("DTEND")) {
        evento.dtend = linha.split(":").pop().substring(0, 8);
      } else if (linha.startsWith("SUMMARY")) {
        evento.summary = linha.split(":").slice(1).join(":").trim();
      }
    }
  });

  return eventos;
}

function getOrlandoOffset(date) {
  var year = date.getUTCFullYear();
  var dstStart = getDSTStart(year);
  var dstEnd   = getDSTEnd(year);
  return (date >= dstStart && date < dstEnd) ? -4 : -5;
}

function getDSTStart(year) {
  var d = new Date(Date.UTC(year, 2, 1));
  var firstSunday = (7 - d.getUTCDay()) % 7;
  return new Date(Date.UTC(year, 2, firstSunday + 8, 7));
}

function getDSTEnd(year) {
  var d = new Date(Date.UTC(year, 10, 1));
  var firstSunday = (7 - d.getUTCDay()) % 7;
  return new Date(Date.UTC(year, 10, firstSunday + 1, 6));
}
