# Glut-Arena

Ein kleines Browser-Spiel für Kinder rund um vier feste Tagesaufgaben. Jeder vollständige Tag
gibt einen **Glut-Orb**. Nach 7 Orbs entwickelt sich das eigene Feuerwesen zur nächsten Stufe —
über drei Stufen und 21 Tage.

Läuft komplett im Browser. Keine Anmeldung, kein Server, keine Datenübertragung.

## Starten

**Als Webseite (empfohlen):** In den Repo-Einstellungen unter *Settings → Pages* als Quelle
`Deploy from a branch` → Branch `main` → Ordner `/ (root)` wählen. Nach ein bis zwei Minuten
liegt das Spiel unter:

```
https://daflosen.github.io/Pipi-Game/
```

**Ohne Hosting:** `index.html` einfach doppelklicken. Funktioniert genauso, nur ohne Link zum Teilen.

**Aufs Handy oder Tablet legen:** Die Seite im Browser öffnen → Teilen/Menü → „Zum Startbildschirm
hinzufügen". Dann startet sie wie eine App im Vollbild, mit eigenem Icon.

## Wie gespeichert wird

Der Spielstand liegt im `localStorage` des jeweiligen Browsers — also auf genau dem Gerät, auf dem
gespielt wird. Nichts wird hochgeladen, es gibt keine Konten und keine Statistik im Hintergrund.

Zwei Folgen daraus:

- Anderer Browser oder anderes Gerät = anderer Spielstand.
- Browserdaten löschen = Spielstand weg.

Für den Umzug auf ein anderes Gerät: Zahnrad → **Daten kopieren**, den Text auf dem neuen Gerät
unten im Papa-Bereich einfügen und speichern.

## Papa-Bereich

Hinter dem Zahnrad oben rechts:

- Trainer-Name eintragen
- Belohnungen pro Woche als übergeben markieren
- Spielstand kopieren oder einfügen
- Zurücksetzen (Sicherheitsabfrage: `RESET` tippen)

## Anpassen

Alles Wesentliche steht als `CONFIG` ganz oben im `<script>`-Block von `index.html`:

```js
const CONFIG = {
  daysTotal: 21,        // Länge des Plans
  orbsPerStage: 7,      // Orbs bis zur nächsten Entwicklung
  stages: [ ... ],      // Namen, Ränge und Beschreibungstexte der drei Stufen
  tasks:  [ ... ],      // die vier Tagesaufgaben inkl. Icon und Farbe
  rewardText: "..."     // was es am Ende der Woche gibt
};
```

Namen, Aufgaben und Belohnungstext lassen sich dort ohne Programmierkenntnisse ändern. Die drei
Kreaturen selbst stecken in `monSVG()` weiter unten.

## Eigene Figur einsetzen

Statt der mitgelieferten Kreatur lässt sich jedes eigene Bild verwenden — eine Zeichnung deines
Kindes, ein Foto einer Knetfigur, ein selbst gezeichnetes SVG.

1. Drei Bilder in den Ordner `bilder/` legen, etwa `stufe1.png`, `stufe2.png`, `stufe3.png`
2. In `index.html` oben bei `CONFIG.stages` jeweils `img` eintragen:

```js
stages: [
  { name:"Knospi",  rank:"Grün-Rang",  line:"...", img:"bilder/stufe1.png" },
  { name:"...",     rank:"...",        line:"...", img:"bilder/stufe2.png" },
  { name:"...",     rank:"...",        line:"...", img:"bilder/stufe3.png" }
]
```

Was gut aussieht: durchsichtiger Hintergrund, etwa 600 Pixel hoch, die Figur steht unten im Bild
auf, alle drei gleich hoch. Dann wackelt beim Stufenwechsel nichts.

Wippen, Hüpfen beim Orb und der weiße Silhouetten-Blitz der Entwicklung funktionieren mit eigenen
Bildern genauso — die Effekte hängen nicht an der SVG-Figur. Bleibt `img` leer, zeichnet das Spiel
seine eigene Kreatur. Fehlt eine Datei, steht statt der Figur ein deutlicher Hinweis im Spielfeld.

Eine Sache noch: Was in `bilder/` liegt, ist bei einem öffentlichen Repo für alle sichtbar. Bei
Bildern aus fremden Spielen oder Serien ist das eine Veröffentlichung — anders als ein Ausdruck,
der zuhause liegen bleibt. Wenn dort etwas landet, das nicht von euch stammt, stell das Repo
besser auf privat und öffne die Datei lokal.

## Zu den Figuren

Zündli, Glutkralle und Infernox sind eigens für dieses Projekt gezeichnete SVG-Figuren. Es werden
bewusst **keine** Grafiken, Namen oder Marken aus bestehenden Spielen oder Serien verwendet.

## Hinweis

Das hier ist ein Motivationsspiel, kein medizinisches Werkzeug. Es belohnt ausschließlich die
Aufgaben, die ein Kind selbst steuern kann — nie ein Ergebnis wie eine trockene Nacht. Bei
anhaltenden Beschwerden ist der Kinderarzt zuständig, nicht die App.

## Ordner `druckvorlage/`

Die Papierversion desselben Plans: dieselben vier Aufgaben, drei Wochen-Arenen, alles als
Ausmal-Vorlage. Die HTML-Datei lässt sich am Bildschirm ausfüllen oder über den Druck-Knopf
ausgeben, das PDF ist direkt druckfertig (4 Seiten A4).

## Spielstand sichern und auf zwei Geräten spielen

Der Stand liegt zunächst nur im Browser des jeweiligen Geräts. Drei Stufen, alle im Papa-Bereich:

**1. Sicherungsdatei.** *Sicherung speichern* legt den Stand als `.json` ab, *Sicherung laden* holt
ihn zurück. Kostet nichts, braucht nichts, fängt den schlimmsten Fall ab.

**2. Abgleich über einen eigenen kleinen Server.** Im Ordner `sync-server/` liegt ein Dienst ohne
Abhängigkeiten, der genau eine JSON-Datei pro Profil speichert:

```bash
cd sync-server
docker compose up -d          # SYNC_KEY in docker-compose.yml vorher ändern
# oder ohne Docker:
SYNC_KEY=langes-geheimwort STATE_DIR=./data node server.js
```

Dann hinter den Reverse Proxy hängen, sodass er per HTTPS erreichbar ist, zum Beispiel unter
`https://sync.deine-domain.de/state`. Im Papa-Bereich Adresse, Schlüssel und Profilname eintragen —
fertig. Der Wolken-Knopf oben zeigt den Zustand: grau = aus, gelb = läuft, grün = abgeglichen,
rot = kein Kontakt.

Wichtig für den Betrieb hinter dem Proxy: `ALLOW_ORIGIN` möglichst auf die konkrete Adresse des
Spiels setzen (z.B. `https://daflosen.github.io`) statt auf `*`.

**3. Gerät 2 einrichten.** Auf Gerät 1 *Link für Gerät 2 kopieren*, den Link auf Gerät 2 öffnen.
Der Link trägt Adresse und Schlüssel im Anker mit, richtet sich selbst ein und holt sofort den
aktuellen Stand. Achtung: Wer den Link hat, kommt an den Spielstand — also nicht in einen
Gruppenchat werfen.

### Wie der Abgleich arbeitet

Zuerst lokal, dann Netz. Jedes Antippen landet sofort im Browser; etwa anderthalb Sekunden später
holt das Spiel den Serverstand, führt ihn mit dem eigenen zusammen und schreibt das Ergebnis zurück.
Zusätzlich beim Start, beim Zurückkehren zur App und einmal pro Minute.

Zusammengeführt wird tageweise: jeder Tag trägt einen Zeitstempel, bei Konflikten gewinnt der
jüngere. Praktisch heißt das: Papa hakt auf dem Handy ab, das Kind auf dem Tablet, beides kommt an.
Wenn beide **denselben Tag** gleichzeitig unterschiedlich bearbeiten, gewinnt der spätere Stand für
diesen Tag komplett.

Ohne Netz — im Auto, unterwegs — läuft alles normal weiter, der Knopf wird nur rot. Sobald wieder
Verbindung besteht, gleicht es von selbst ab.

### API des Sync-Servers

```
GET  /state?id=kind1&key=GEHEIM   -> {"state": {...}}  bzw. {"state": null}
POST /state?id=kind1&key=GEHEIM   -> Spielstand als JSON im Body
GET  /health                      -> {"ok": true}
```

Beim Schreiben wird der vorherige Stand als `.bak` daneben gelegt und die neue Datei atomar
umbenannt. Falscher oder fehlender Schlüssel gibt 401, `id` wird auf harmlose Zeichen reduziert.
Wer es ohne eigenen Dienst mag: dieselben zwei Routen lassen sich auch als n8n-Webhook bauen
(Webhook → Switch auf die Methode → Datei lesen bzw. schreiben → Respond).
