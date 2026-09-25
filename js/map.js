// js/map.js
// Google Maps inicializálás és a térképes interakció. A jövőbeli natív
// Android verzióban ezt teljes egészében leváltja majd a natív térkép API.

import {
  BUDAPEST_CENTER,
  DEFAULT_ZOOM,
  GOOGLE_MAPS_API_KEY,
  STOP_ICON_MIN_ZOOM,
  OFFICIAL_MODE_COLOR_PRIORITY,
  DEFAULT_STOP_COLOR,
  FAVORITES_REFRESH_MS,
} from "./config.js";
import { getStopsInBounds, getArrivals } from "./api.js";
import {
  showLoading,
  showError,
  showStopHeader,
  renderArrivals,
  showMessage,
  openPopup,
  setFavoritePlaceholder,
  setFavoriteStopName,
  showFavoriteLoading,
  showFavoriteMessage,
  showFavoriteError,
  renderFavoriteArrivals,
  setPickingState,
} from "./ui.js";
import { saveFavoriteStop, getFavoriteStop } from "./settings.js";

let map;
let stopMarkers = [];
let userLocationMarker;
let pickingFavoriteSlot = null;
const favoriteIntervals = {};

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
      // Nevezetességek, éttermek, szállodák stb. elrejtése — csak a saját
      // megállóikonjaink jelenjenek meg a térképen.
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      // A Google alaptérkép saját (nem stílusozható) tömegközlekedési ikonjai
      // helyett saját, mód szerint színezett jelölőket rajzolunk ki (lásd
      // refreshStopMarkers).
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ],
  });

  map.addListener("idle", refreshStopMarkers);
  wireLocateButton();
}

// --- Saját megállójelölők ---
// A Google TransitLayer ikonjai nem stílusozhatók (mind ugyanaz a szín,
// és bárhova kattintva a beépített, tőlünk független popupját mutatja),
// ezért a látható térképrészletben (bounds) magunk kérjük le a BKK-tól a
// valódi megállókat, és mi rajzoljuk ki + kötjük be a kattintást — így
// csakis egy konkrét megállóra kattintva jelenik meg bármi is.
async function refreshStopMarkers() {
  clearStopMarkers();
  if (map.getZoom() < STOP_ICON_MIN_ZOOM) return;

  const bounds = map.getBounds();
  if (!bounds) return;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const center = bounds.getCenter();

  try {
    const stops = await getStopsInBounds({
      lat: center.lat(),
      lng: center.lng(),
      latSpan: ne.lat() - sw.lat(),
      lonSpan: ne.lng() - sw.lng(),
    });
    stops.forEach(addStopMarker);
  } catch (err) {
    // Csendben elnyeljük — a megállóikonok frissítése a háttérben történik,
    // egy átmeneti hálózati hiba miatt nem szakítjuk meg a térképhasználatot.
  }
}

/**
 * Egy fizikai megálló hivatalos színei közül (lásd getStopsInBounds) az
 * ikonhoz tartozó szín kiválasztása. Ha több mód is közlekedik ugyanott
 * (pl. busz és trolibusz is megáll), a prioritási lista alapján egyet
 * választunk — jelenleg a busz nyer, ha busz is érinti a megállót.
 */
function pickStopColor(colors) {
  for (const { hex, color } of OFFICIAL_MODE_COLOR_PRIORITY) {
    if (colors.includes(hex)) return color;
  }
  return colors[0] ? `#${colors[0]}` : DEFAULT_STOP_COLOR;
}

// Az eredeti (Google/BKK) megállóikonokhoz hasonló, lekerekített négyzet —
// nem a Google alapértelmezett kerek marker.
function stopIconUrl(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="4" fill="${color}" stroke="#ffffff" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function addStopMarker(stop) {
  const color = pickStopColor(stop.colors);
  const marker = new google.maps.Marker({
    position: { lat: stop.lat, lng: stop.lon },
    map,
    title: stop.name,
    icon: {
      url: stopIconUrl(color),
      scaledSize: new google.maps.Size(18, 18),
      anchor: new google.maps.Point(9, 9),
    },
  });
  marker.addListener("click", () => {
    if (pickingFavoriteSlot) {
      assignFavorite(pickingFavoriteSlot, stop);
    } else {
      showStopArrivals(stop);
    }
  });
  stopMarkers.push(marker);
}

function clearStopMarkers() {
  stopMarkers.forEach((m) => m.setMap(null));
  stopMarkers = [];
}

async function showStopArrivals(stop) {
  showLoading();
  try {
    showStopHeader(stop);
    const { stopTimes, references } = await getArrivals(stop.id);
    renderArrivals(stopTimes, references);
  } catch (err) {
    showError(err.message);
  }
}

// --- Saját pozíció gomb ---
function wireLocateButton() {
  const btn = document.getElementById("locate-btn");
  btn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showMessage("A böngésződ nem támogatja a helymeghatározást.");
      openPopup();
      return;
    }
    btn.classList.add("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        btn.classList.remove("locating");
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(here);
        map.setZoom(Math.max(map.getZoom(), 17));
        placeUserLocationMarker(here);
      },
      () => {
        btn.classList.remove("locating");
        showMessage("Nem sikerült lekérni a pozíciódat — engedélyezd a helymeghatározást a böngészőben.");
        openPopup();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Kék hátterű, sötétebb középpontú jelölő — jobban elüt a térkép színeitől,
// mint egy sima egyszínű pötty.
function userLocationIconUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="#1a73e8" stroke="#ffffff" stroke-width="3"/><circle cx="13" cy="13" r="4" fill="#0e2233"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function placeUserLocationMarker(position) {
  if (!userLocationMarker) {
    userLocationMarker = new google.maps.Marker({
      map,
      icon: {
        url: userLocationIconUrl(),
        scaledSize: new google.maps.Size(26, 26),
        anchor: new google.maps.Point(13, 13),
      },
      zIndex: 999,
      title: "Saját pozíció",
    });
  }
  userLocationMarker.setPosition(position);
}

// --- Kedvenc megállók (bal oldali panel) ---
// A cél a mobilalkalmazás-koncepció előpróbája: két kedvenc megálló érkező
// járatai azonnal, keresgélés nélkül látszanak, és percenként frissülnek.

function initFavorites() {
  [1, 2].forEach((slot) => {
    const stop = getFavoriteStop(slot);
    if (stop) {
      setFavoriteStopName(slot, stop.name);
      loadFavoriteArrivals(slot, stop);
      startFavoriteRefresh(slot, stop);
    } else {
      setFavoritePlaceholder(slot);
    }
  });
}

function wireFavoritePickButtons() {
  document.querySelectorAll(".favorite-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => togglePicking(Number(btn.dataset.slot)));
  });
}

function togglePicking(slot) {
  pickingFavoriteSlot = pickingFavoriteSlot === slot ? null : slot;
  setPickingState(pickingFavoriteSlot, pickingFavoriteSlot !== null);
  if (map) map.setOptions({ draggableCursor: pickingFavoriteSlot ? "crosshair" : null });
}

function assignFavorite(slot, stop) {
  saveFavoriteStop(slot, stop);
  setFavoriteStopName(slot, stop.name);
  loadFavoriteArrivals(slot, stop);
  startFavoriteRefresh(slot, stop);
  pickingFavoriteSlot = null;
  setPickingState(null, false);
  if (map) map.setOptions({ draggableCursor: null });
}

async function loadFavoriteArrivals(slot, stop) {
  showFavoriteLoading(slot);
  try {
    const { stopTimes, references } = await getArrivals(stop.id);
    renderFavoriteArrivals(slot, stopTimes, references);
  } catch (err) {
    showFavoriteError(slot, err.message);
  }
}

function startFavoriteRefresh(slot, stop) {
  if (favoriteIntervals[slot]) clearInterval(favoriteIntervals[slot]);
  favoriteIntervals[slot] = setInterval(() => loadFavoriteArrivals(slot, stop), FAVORITES_REFRESH_MS);
}

wireFavoritePickButtons();
initFavorites();

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
