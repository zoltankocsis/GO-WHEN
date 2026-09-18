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
