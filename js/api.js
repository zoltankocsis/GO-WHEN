// js/api.js
// Nyers adatlekérés a BKK FUTÁR API-ból. Nincs benne DOM-manipuláció —
// ez a fájl így a mobil (Capacitor) verzióban is változtatás nélkül
// újrahasználható lesz.

import { BKK_API_KEY, BKK_API_BASE, NEAREST_STOP_RADIUS_M, ARRIVALS_MINUTES_AHEAD } from "./config.js";

/**
 * Legközelebbi megálló keresése egy koordináta alapján.
 *
 * A stops-for-location néha egy "stop-area" klasztert ad vissza legközelebbi
 * találatként (id "CS" előtaggal, locationType 1) egy nagyobb csomópontnál
 * (pl. egy metróvégállomás összes peronja). Egy ilyen klaszter routeIds-a
 * az ÖSSZES hozzá tartozó fizikai megálló járatainak uniója — ha ezt adnánk
 * vissza, a következő lépésben (getArrivals) a szomszédos peronok járatai is
 * bekeverednének a listába. Ezért csak a valódi, beszállásra használható
 * megállók közül (locationType 0) választjuk a legközelebbit.
 * @returns {Promise<{id: string, name: string} | null>}
 */
export async function findNearestStop(lat, lng) {
  const url = `${BKK_API_BASE}/stops-for-location.json?key=${BKK_API_KEY}&lat=${lat}&lon=${lng}&radius=${NEAREST_STOP_RADIUS_M}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BKK API hiba: ${res.status}`);
  const data = await res.json();
  const stops = data?.data?.list || [];
  if (!stops.length) return null;
  // a BKK távolság szerint rendezve adja vissza, ezért az első megfelelő a legközelebbi
  const boardable = stops.filter((s) => s.locationType === 0);
  const s = boardable[0] || stops[0];
  return { id: s.id, name: s.name };
}

/**
 * Egy megálló következő érkezései.
 * A "where" API a járat- és útvonaladatokat nem közvetlenül a stopTimes
 * bejegyzésekben adja vissza, hanem egy külön "references" blokkban
 * (routeId / tripId alapján kikereshető) — ezért kell mindkettőt visszaadni.
 * A stopTimes bejegyzéseket a kért stopId-ra szűrjük: klaszter-azonosítóknál
 * (lásd findNearestStop) az API a csoport összes megállójának érkezését
 * visszaadja, és ilyenkor bejegyzésenként eltérő stopId mezőt ad vissza —
 * ez a szűrés a védőháló arra az esetre, ha mégis egy klaszter-id kerülne
 * ide. Egyetlen (nem klaszter) megálló lekérésekor a stopId mező nincs
 * jelen az egyes bejegyzéseken (mivel egyértelmű), ezért azokat a hiányzó
 * stopId mezővel is megtartjuk.
 * @returns {Promise<{stopTimes: Array, references: {routes: object, trips: object}}>}
 */
export async function getArrivals(stopId) {
  const url = `${BKK_API_BASE}/arrivals-and-departures-for-stop.json?key=${BKK_API_KEY}&stopId=${stopId}&minutesAfter=${ARRIVALS_MINUTES_AHEAD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BKK API hiba: ${res.status}`);
  const data = await res.json();
  const stopTimes = (data?.data?.entry?.stopTimes || []).filter((st) => !st.stopId || st.stopId === stopId);
  return {
    stopTimes,
    references: data?.data?.references || {},
  };
}

/**
 * Nyers stopTimes bejegyzés → egyszerű, megjelenítésre kész formátum.
 * A stopTimes bejegyzésen nincs se routeId, se routeShortName közvetlenül —
 * csak tripId. A járatszámhoz ezért előbb a references.trips-ből kell
 * kikeresni a routeId-t, majd azzal a references.routes-ból a shortName-t.
 */
export function formatArrival(item, references = {}) {
  const eta = item.predictedArrivalTime || item.arrivalTime;
  const now = Date.now() / 1000;
  const trip = references.trips?.[item.tripId];
  const route = trip && references.routes?.[trip.routeId];
  return {
    line: route?.shortName || "?",
    destination: item.stopHeadsign || trip?.tripHeadsign || "",
    minutesUntilArrival: Math.max(0, Math.round((eta - now) / 60)),
  };
}
