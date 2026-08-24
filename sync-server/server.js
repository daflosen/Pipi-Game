/**
 * Glut-Arena Sync - der kleinstmögliche Speicherdienst.
 *
 * Keine Abhängigkeiten, kein Framework, eine JSON-Datei pro Spielstand.
 * Gedacht für den Betrieb hinter einem Reverse Proxy, der TLS macht.
 *
 *   GET  /state?id=ben&key=GEHEIM   -> {"state": {...}} oder {"state": null}
 *   POST /state?id=ben&key=GEHEIM   -> Body ist der Spielstand als JSON
 *
 * Umgebungsvariablen:
 *   SYNC_KEY       Pflicht. Ohne passenden key-Parameter gibt es 401.
 *   STATE_DIR      Ordner für die Dateien (Standard: ./data)
 *   PORT           Standard: 8099
 *   ALLOW_ORIGIN   Standard: *  - besser die konkrete Adresse eintragen,
 *                  z.B. https://daflosen.github.io
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const KEY = process.env.SYNC_KEY || "";
const DIR = process.env.STATE_DIR || path.join(__dirname, "data");
const PORT = Number(process.env.PORT || 8099);
const ORIGIN = process.env.ALLOW_ORIGIN || "*";
const MAX_BODY = 256 * 1024;

if (!KEY) {
  console.error("SYNC_KEY fehlt. Beispiel: SYNC_KEY=langes-geheimwort node server.js");
  process.exit(1);
}
fs.mkdirSync(DIR, { recursive: true });

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store"
};
const send = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8" }, cors));
  res.end(body);
};

/* Zeitkonstanter Vergleich, damit der Schlüssel nicht per Laufzeit erraten wird */
function keyOk(given) {
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(KEY);
  if (a.length !== b.length) return false;
  return require("crypto").timingSafeEqual(a, b);
}

const fileFor = id => {
  const clean = String(id || "default").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32) || "default";
  return path.join(DIR, clean + ".json");
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");

  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (url.pathname === "/health") return send(res, 200, { ok: true });
  if (url.pathname !== "/state") return send(res, 404, { error: "Unbekannter Pfad" });
  if (!keyOk(url.searchParams.get("key"))) return send(res, 401, { error: "Schlüssel stimmt nicht" });

  const file = fileFor(url.searchParams.get("id"));

  if (req.method === "GET") {
    fs.readFile(file, "utf8", (err, txt) => {
      if (err) return send(res, 200, { state: null });
      try { send(res, 200, { state: JSON.parse(txt) }); }
      catch (e) { send(res, 200, { state: null }); }
    });
    return;
  }

  if (req.method === "POST") {
    let body = "", tooBig = false;
    req.on("data", c => {
      body += c;
      if (body.length > MAX_BODY) { tooBig = true; req.destroy(); }
    });
    req.on("end", () => {
      if (tooBig) return send(res, 413, { error: "Zu groß" });
      let parsed;
      try { parsed = JSON.parse(body); } catch (e) { return send(res, 400, { error: "Kein gültiges JSON" }); }
      if (!parsed || typeof parsed !== "object") return send(res, 400, { error: "Kein Objekt" });
      const tmp = file + ".tmp";
      fs.writeFile(tmp, JSON.stringify(parsed), err => {
        if (err) return send(res, 500, { error: "Schreiben fehlgeschlagen" });
        /* vorherigen Stand als .bak behalten, dann atomar ersetzen */
        fs.copyFile(file, file + ".bak", () => {
          fs.rename(tmp, file, err2 => {
            if (err2) return send(res, 500, { error: "Umbenennen fehlgeschlagen" });
            send(res, 200, { ok: true, saved: new Date().toISOString() });
          });
        });
      });
    });
    return;
  }

  send(res, 405, { error: "Methode nicht erlaubt" });
});

server.listen(PORT, () => console.log("Glut-Arena Sync läuft auf Port " + PORT + ", Daten in " + DIR));
