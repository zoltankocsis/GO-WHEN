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
