// js/config.js
// Ide kerülnek a saját API-kulcsok. Ez a fájl a jövőben (Capacitor build)
// is változtatás nélkül újrahasználható lesz.

export const BKK_API_KEY = "781a4ae8-666b-44b6-b404-6ea65fe28aca"; // https://opendata.bkk.hu
export const BKK_API_BASE = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where";
export const GOOGLE_MAPS_API_KEY = "AIzaSyAX-q8IALXYLb4Lb63V445EAYFc5Tfhh3I"; // console.cloud.google.com

export const BUDAPEST_CENTER = { lat: 47.4979, lng: 19.0402 };
export const DEFAULT_ZOOM = 13;
export const ARRIVALS_MINUTES_AHEAD = 180;
export const MAX_ARRIVALS_SHOWN = 25;

// Ennél kisebb nagyításnál nem kérünk le és nem rajzolunk ki megállóikonokat —
// kicsomózott nézetben túl sok lenne a jelölő, és ez a BKK API-t is feleslegesen
// terhelné.
export const STOP_ICON_MIN_ZOOM = 15;

// Megállóikon színe közlekedési mód szerint (a Google TransitLayer erre nem ad
// lehetőséget, ezért saját jelölőket rajzolunk ki a BKK adatai alapján).
export const STOP_TYPE_COLORS = {
  BUS: "#1a73e8",
  TROLLEYBUS: "#d93025",
  TRAM: "#f2b705",
  SUBWAY: "#f57c00",
  SUBURBAN_RAILWAY: "#188038",
  RAIL: "#188038",
  COACH: "#6b7280",
};
export const DEFAULT_STOP_COLOR = "#6b7280";

// A járatszám-jelvény (line-badge) szövegszíne módonként — sárga (villamos)
// háttéren sötét, minden más (telített kék/piros/stb.) háttéren világos szöveg
// olvasható jobban.
export const STOP_TYPE_TEXT_COLORS = { TRAM: "#0e2233" };
export const DEFAULT_STOP_TEXT_COLOR = "#ffffff";

// Egy fizikai megállóban több jármű is közlekedhet (pl. egy megállóban busz
// ÉS trolibusz is megáll) — ilyenkor a BKK stops-for-location válaszában a
// "style.colors" mező több hivatalos hexet is tartalmaz. A térképi ikonhoz
// ebből egyetlen színt kell választani: az alábbi prioritási lista alapján
// (busz nyer, ha busz is közlekedik ott).
export const OFFICIAL_MODE_COLOR_PRIORITY = [
  { hex: "009EE3", color: STOP_TYPE_COLORS.BUS },
  { hex: "E41F18", color: STOP_TYPE_COLORS.TROLLEYBUS },
  { hex: "FFD800", color: STOP_TYPE_COLORS.TRAM },
];

// Kedvenc megállók automatikus frissítési gyakorisága (a bal oldali panelben).
export const FAVORITES_REFRESH_MS = 60000;
