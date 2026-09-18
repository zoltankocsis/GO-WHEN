#!/bin/bash
set -e
mkdir -p css js mobile assets

cat > "README.md" << 'GOWHEN_EOF'
# GO-WHEN — Busz Most

Élő budapesti buszérkezés-kereső — portfólióprojekt.

## Könyvtárszerkezet

```
GO-WHEN/
├── index.html          → a weboldal váza
├── css/
│   └── style.css       → minden stílus
├── js/
│   ├── config.js       → API-kulcsok, konstansok
│   ├── api.js          → BKK FUTÁR API hívások (nyers adat)
│   ├── settings.js     → Otthon/munkahely mentése (localStorage)
│   ├── ui.js            → felugró kártya, listák megjelenítése
│   └── map.js           → Google Maps inicializálás, kattintás-kezelés
├── assets/              → ikonok, képek (később)
├── mobile/               → helye a jövőbeli Capacitor/Android projektnek
└── README.md
```

## Miért van így szétválasztva

A cél, hogy a `js/` mappában lévő logika (API hívás, mentés, adatfeldolgozás)
később **változtatás nélkül újrahasználható** legyen egy Capacitor-alapú
Android alkalmazásban — csak a `map.js` és `ui.js` fájlokat kell majd
natívabb megjelenítésre cserélni, az `api.js` és `settings.js` mehet tovább.

## Fejlesztési sorrend (terv)

1. Weboldal MVP (jelen állapot)
2. GitHub Pages publikálás (`main` ág, `/ (root)` mappa)
3. Capacitor becsomagolás → APK (a `mobile/` mappában)
4. Natív Android widget (Kotlin, külön fázis)

## Nem hivatalos projekt

Nem a BKK terméke, független fejlesztés a nyilvános FUTÁR API alapján.
GOWHEN_EOF

cat > ".gitignore" << 'GOWHEN_EOF'
node_modules/
mobile/android/
mobile/ios/
*.apk
.DS_Store
GOWHEN_EOF

cat > "mobile/README.md" << 'GOWHEN_EOF'
# mobile/ — jövőbeli Android csomagolás

Ide kerül majd a Capacitor projekt, ami a gyökérben lévő weboldalt
natív Android alkalmazássá (APK) csomagolja.

Tervezett lépések (még nincs elkezdve):

1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap init` — ez a mappa lesz a Capacitor projekt gyökere
3. A `../js/api.js` és `../js/settings.js` fájlok változtatás nélkül
   újrahasználhatók lesznek itt is
4. Natív widget: külön Kotlin modul, ha idáig eljutunk
GOWHEN_EOF

cat > "index.html" << 'GOWHEN_EOF'
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Busz Most — élő budapesti buszinformáció</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>
  <h1>Busz Most</h1>
  <p>Élő budapesti buszérkezések — egy koppintással</p>
</header>

<main>

  <div class="setup-note">
    Ehhez a demóhoz saját API-kulcsok kellenek. Lásd a <code>js/config.js</code> fájlt.
  </div>

  <section>
    <h2>Térképes demó</h2>
    <div class="card">
      <div id="map"></div>
      <p class="hint">Kattints a térképen egy pontra — megkeresem a hozzá legközelebbi megállót, és megmutatom, mikor jön a következő busz.</p>
    </div>
  </section>

  <section>
    <h2>Otthon és munkahely</h2>
    <div class="card">
      <div class="settings-row">
        <label for="home-input">Otthon</label>
        <input id="home-input" type="text" placeholder="Megálló neve vagy keresés a térképen">
        <span class="stop-name" id="home-stop-name">nincs beállítva</span>
      </div>
      <div class="settings-row">
        <label for="work-input">Munkahely</label>
        <input id="work-input" type="text" placeholder="Megálló neve vagy keresés a térképen">
        <span class="stop-name" id="work-stop-name">nincs beállítva</span>
      </div>
      <button id="save-settings">Mentés</button>
      <button class="secondary" id="show-active">Aktív megálló mutatása most</button>
      <p class="hint">A widget napszak szerint automatikusan az otthoni vagy munkahelyi megállót mutatja majd (pl. reggel a munkahelyi, este az otthoni).</p>
    </div>
  </section>

</main>

<footer>Nem hivatalos, független projekt — nem a BKK terméke.</footer>

<div class="popup" id="popup">
  <button class="close" id="popup-close">✕</button>
  <p class="stop-title" id="popup-title">Megálló</p>
  <p class="stop-sub" id="popup-sub"></p>
  <div id="popup-body"></div>
</div>

<script type="module" src="js/map.js"></script>

</body>
</html>
GOWHEN_EOF

cat > "css/style.css" << 'GOWHEN_EOF'
:root {
  --ink: #0e2233;
  --paper: #f3efe6;
  --line-blue: #1c4b82;
  --line-blue-dark: #0f3a5c;
  --stop-yellow: #f2b705;
  --muted: #5c6b78;
  --card: #ffffff;
  --radius: 14px;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: "Segoe UI", Roboto, -apple-system, sans-serif;
  background: var(--paper);
  color: var(--ink);
}
header {
  background: var(--line-blue);
  color: #fff;
  padding: 22px 20px 26px;
  position: relative;
  overflow: hidden;
}
header::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -40px;
  width: 160px;
  height: 160px;
  background: var(--stop-yellow);
  border-radius: 50%;
  opacity: 0.15;
}
header h1 {
  margin: 0 0 4px;
  font-size: 1.6rem;
  letter-spacing: -0.01em;
}
header p {
  margin: 0;
  color: #cfe0f2;
  font-size: 0.95rem;
}
main {
  max-width: 720px;
  margin: 0 auto;
  padding: 18px 16px 60px;
}
section {
  margin-top: 22px;
}
h2 {
  font-size: 1.05rem;
  margin: 0 0 10px;
  color: var(--line-blue);
}
.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(14, 34, 51, 0.08);
}
#map {
  width: 100%;
  height: 340px;
  border-radius: var(--radius);
  overflow: hidden;
}
.hint {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 8px;
}
.settings-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}
.settings-row label {
  width: 92px;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.settings-row input {
  flex: 1;
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid #d7dde2;
  font-size: 0.95rem;
}
.settings-row .stop-name {
  font-size: 0.85rem;
  color: var(--muted);
  min-width: 130px;
}
button {
  background: var(--stop-yellow);
  color: var(--ink);
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}
button:hover {
  filter: brightness(0.96);
}
button.secondary {
  background: transparent;
  border: 1.5px solid var(--line-blue);
  color: var(--line-blue);
}

/* Felugró kártya — a jövőbeli widget stílusát előlegezi meg */
.popup {
  position: fixed;
  left: 50%;
  bottom: -320px;
  transform: translateX(-50%);
  width: min(92vw, 380px);
  background: var(--ink);
  color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 18px 18px 22px;
  transition: bottom 0.28s ease;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.25);
  z-index: 20;
}
.popup.open {
  bottom: 0;
}
.popup .stop-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 2px;
}
.popup .stop-sub {
  font-size: 0.8rem;
  color: #a9bccd;
  margin: 0 0 14px;
}
.arrival-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.arrival-row .line-badge {
  background: var(--stop-yellow);
  color: var(--ink);
  font-weight: 800;
  font-size: 0.82rem;
  padding: 3px 9px;
  border-radius: 6px;
  min-width: 34px;
  text-align: center;
}
.arrival-row .dest {
  flex: 1;
  margin: 0 10px;
  font-size: 0.88rem;
  color: #e3ecf3;
}
.arrival-row .eta {
  font-weight: 700;
  font-size: 0.92rem;
}
.popup .close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  color: #9fb3c4;
  font-size: 1.1rem;
  padding: 2px 6px;
}
.empty-note {
  color: #a9bccd;
  font-size: 0.85rem;
  padding: 14px 0 2px;
}
footer {
  text-align: center;
  color: var(--muted);
  font-size: 0.78rem;
  padding: 20px 16px 40px;
}
.setup-note {
  background: #fff7e0;
  border: 1px solid #f0d98a;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.85rem;
  color: #6b5615;
  margin-bottom: 16px;
}
code {
  background: #eee;
  padding: 1px 5px;
  border-radius: 4px;
}
GOWHEN_EOF

cat > "js/config.js" << 'GOWHEN_EOF'
// js/config.js
// Ide kerülnek a saját API-kulcsok. Ez a fájl a jövőben (Capacitor build)
// is változtatás nélkül újrahasználható lesz.

export const BKK_API_KEY = "IDE_ÍRD_A_BKK_KULCSOT"; // https://opendata.bkk.hu
export const BKK_API_BASE = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where";
export const GOOGLE_MAPS_API_KEY = "IDE_ÍRD_A_GOOGLE_MAPS_KULCSOT"; // console.cloud.google.com

export const BUDAPEST_CENTER = { lat: 47.4979, lng: 19.0402 };
export const DEFAULT_ZOOM = 13;
export const NEAREST_STOP_RADIUS_M = 400;
export const ARRIVALS_MINUTES_AHEAD = 60;
export const MAX_ARRIVALS_SHOWN = 6;

// Napszak szerinti váltás: melyik órák között legyen a "munkahelyi" aktív
export const WORK_HOURS_START = 6;
export const WORK_HOURS_END = 15;
GOWHEN_EOF

cat > "js/api.js" << 'GOWHEN_EOF'
// js/api.js
// Nyers adatlekérés a BKK FUTÁR API-ból. Nincs benne DOM-manipuláció —
// ez a fájl így a mobil (Capacitor) verzióban is változtatás nélkül
// újrahasználható lesz.

import { BKK_API_KEY, BKK_API_BASE, NEAREST_STOP_RADIUS_M, ARRIVALS_MINUTES_AHEAD } from "./config.js";

/**
 * Legközelebbi megálló keresése egy koordináta alapján.
 * @returns {Promise<{id: string, name: string} | null>}
 */
export async function findNearestStop(lat, lng) {
  const url = `${BKK_API_BASE}/stops-for-location.json?key=${BKK_API_KEY}&lat=${lat}&lon=${lng}&radius=${NEAREST_STOP_RADIUS_M}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BKK API hiba: ${res.status}`);
  const data = await res.json();
  const stops = data?.data?.list || [];
  if (!stops.length) return null;
  const s = stops[0]; // a BKK távolság szerint rendezve adja vissza
  return { id: s.id, name: s.name };
}

/**
 * Egy megálló következő érkezései.
 * @returns {Promise<Array>} nyers stopTimes lista
 */
export async function getArrivals(stopId) {
  const url = `${BKK_API_BASE}/arrivals-and-departures-for-stop.json?key=${BKK_API_KEY}&stopId=${stopId}&minutesAfter=${ARRIVALS_MINUTES_AHEAD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BKK API hiba: ${res.status}`);
  const data = await res.json();
  return data?.data?.entry?.stopTimes || [];
}

/**
 * Nyers stopTimes bejegyzés → egyszerű, megjelenítésre kész formátum.
 */
export function formatArrival(item) {
  const eta = item.predictedArrivalTime || item.scheduledArrivalTime;
  const now = Date.now() / 1000;
  return {
    line: item.routeShortName || "?",
    destination: item.headsign || "",
    minutesUntilArrival: Math.max(0, Math.round((eta - now) / 60)),
  };
}
GOWHEN_EOF

cat > "js/settings.js" << 'GOWHEN_EOF'
// js/settings.js
// Otthon/munkahely megálló mentése és lekérése. Egyszerű localStorage-alapú
// tárolás — ugyanez a logika (más tárolóval, pl. SharedPreferences) fog
// visszaköszönni a jövőbeli Android verzióban.

import { WORK_HOURS_START, WORK_HOURS_END } from "./config.js";

const HOME_KEY = "gowhen_home";
const WORK_KEY = "gowhen_work";

/** @param {{id: string, name: string}} stop */
export function saveHomeStop(stop) {
  localStorage.setItem(HOME_KEY, JSON.stringify(stop));
}

/** @param {{id: string, name: string}} stop */
export function saveWorkStop(stop) {
  localStorage.setItem(WORK_KEY, JSON.stringify(stop));
}

export function getHomeStop() {
  return JSON.parse(localStorage.getItem(HOME_KEY) || "null");
}

export function getWorkStop() {
  return JSON.parse(localStorage.getItem(WORK_KEY) || "null");
}

/**
 * Melyik megálló legyen aktív most, a napszak alapján.
 * @returns {{stop: object|null, label: string}}
 */
export function getActiveStop() {
  const hour = new Date().getHours();
  const useWork = hour >= WORK_HOURS_START && hour < WORK_HOURS_END;
  return {
    stop: useWork ? getWorkStop() : getHomeStop(),
    label: useWork ? "munkahelyi megálló (nappal)" : "otthoni megálló (este/reggel)",
  };
}
GOWHEN_EOF

cat > "js/ui.js" << 'GOWHEN_EOF'
// js/ui.js
// Minden DOM-manipuláció itt van összegyűjtve. Ez a fájl NEM lesz
// újrahasználható a natív Android verzióban (ott saját natív UI lesz),
// de a webes/Capacitor verzióban igen.

import { MAX_ARRIVALS_SHOWN } from "./config.js";
import { formatArrival } from "./api.js";

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupSub = document.getElementById("popup-sub");
const popupBody = document.getElementById("popup-body");

export function openPopup() {
  popup.classList.add("open");
}

export function closePopup() {
  popup.classList.remove("open");
}

export function showLoading() {
  popupTitle.textContent = "Keresés...";
  popupSub.textContent = "";
  popupBody.innerHTML = '<p class="empty-note">Legközelebbi megálló keresése…</p>';
  openPopup();
}

export function showError(message) {
  popupTitle.textContent = "Hiba";
  popupBody.innerHTML = `<p class="empty-note">Nem sikerült lekérni az adatokat. (${message})</p>`;
}

export function showNoStopFound() {
  popupTitle.textContent = "Nincs találat";
  popupBody.innerHTML = '<p class="empty-note">A közelben nem található megálló.</p>';
}

export function showStopHeader(stop) {
  popupTitle.textContent = stop.name;
  popupSub.textContent = `Megálló azonosító: ${stop.id}`;
}

export function showActiveStopHeader(stop, label) {
  popupTitle.textContent = stop ? stop.name : "Nincs beállítva megálló";
  popupSub.textContent = stop ? `Aktív: ${label}` : "";
}

export function renderArrivals(rawList) {
  if (!rawList.length) {
    popupBody.innerHTML = '<p class="empty-note">A következő órában nincs érkező járat.</p>';
    return;
  }
  const items = rawList.slice(0, MAX_ARRIVALS_SHOWN).map(formatArrival);
  popupBody.innerHTML = items
    .map(
      (a) => `
      <div class="arrival-row">
        <span class="line-badge">${a.line}</span>
        <span class="dest">${a.destination}</span>
        <span class="eta">${a.minutesUntilArrival} perc</span>
      </div>`
    )
    .join("");
}

export function showMessage(text) {
  popupBody.innerHTML = `<p class="empty-note">${text}</p>`;
}

document.getElementById("popup-close").addEventListener("click", closePopup);
GOWHEN_EOF

cat > "js/map.js" << 'GOWHEN_EOF'
// js/map.js
// Google Maps inicializálás és a térképes interakció. A jövőbeli natív
// Android verzióban ezt teljes egészében leváltja majd a natív térkép API.

import { BUDAPEST_CENTER, DEFAULT_ZOOM, GOOGLE_MAPS_API_KEY } from "./config.js";
import { findNearestStop, getArrivals } from "./api.js";
import {
  showLoading,
  showError,
  showNoStopFound,
  showStopHeader,
  renderArrivals,
  showActiveStopHeader,
  showMessage,
  openPopup,
} from "./ui.js";
import { saveHomeStop, saveWorkStop, getHomeStop, getWorkStop, getActiveStop } from "./settings.js";

let map;
let marker;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: BUDAPEST_CENTER,
    zoom: DEFAULT_ZOOM,
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f3efe6" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#5c6b78" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfe0f2" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    ],
  });

  map.addListener("click", (e) => {
    placeMarker(e.latLng);
    showNearestStopArrivals(e.latLng.lat(), e.latLng.lng());
  });
}

function placeMarker(latLng) {
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({ position: latLng, map });
}

async function showNearestStopArrivals(lat, lng) {
  showLoading();
  try {
    const stop = await findNearestStop(lat, lng);
    if (!stop) {
      showNoStopFound();
      return;
    }
    showStopHeader(stop);
    const arrivals = await getArrivals(stop.id);
    renderArrivals(arrivals);
  } catch (err) {
    showError(err.message);
  }
}

// --- Beállítások űrlap bekötése ---
function wireSettingsForm() {
  const homeInput = document.getElementById("home-input");
  const workInput = document.getElementById("work-input");
  const homeStopName = document.getElementById("home-stop-name");
  const workStopName = document.getElementById("work-stop-name");

  const home = getHomeStop();
  const work = getWorkStop();
  if (home) homeStopName.textContent = home.name;
  if (work) workStopName.textContent = work.name;

  document.getElementById("save-settings").addEventListener("click", () => {
    // Egyszerűsített demó: a beírt szöveg lesz a név.
    // Éles verzióban ezt a térképes kereséssel kötnénk össze (id + name).
    if (homeInput.value) {
      saveHomeStop({ id: null, name: homeInput.value });
      homeStopName.textContent = homeInput.value;
    }
    if (workInput.value) {
      saveWorkStop({ id: null, name: workInput.value });
      workStopName.textContent = workInput.value;
    }
  });

  document.getElementById("show-active").addEventListener("click", () => {
    const { stop, label } = getActiveStop();
    showActiveStopHeader(stop, label);
    showMessage(
      stop
        ? "Ehhez a nézethez add hozzá a megálló-azonosítót is a mentéskor — a demó egyelőre csak a nevet tárolja."
        : "Állítsd be az otthoni és munkahelyi megállót fent."
    );
    openPopup();
  });
}

wireSettingsForm();

// A Google Maps callback-nek globálisan elérhetőnek kell lennie,
// modulok esetén ezért kell explicit a window-ra tenni.
window.initMap = initMap;

// A Google Maps szkriptet itt töltjük be dinamikusan, hogy biztosan
// azután fusson, hogy a window.initMap már létezik.
(function loadGoogleMaps() {
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
  s.async = true;
  document.head.appendChild(s);
})();
GOWHEN_EOF

echo "Kész: a GO-WHEN mappaszerkezet létrejött."
