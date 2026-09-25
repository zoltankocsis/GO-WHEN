// js/api.js
// Nyers adatlekérés a BKK FUTÁR API-ból. Nincs benne DOM-manipuláció —
// ez a fájl így a mobil (Capacitor) verzióban is változtatás nélkül
// újrahasználható lesz.

import {
  BKK_API_KEY,
  BKK_API_BASE,
  ARRIVALS_MINUTES_AHEAD,
  STOP_TYPE_COLORS,
  DEFAULT_STOP_COLOR,
  STOP_TYPE_TEXT_COLORS,
  DEFAULT_STOP_TEXT_COLOR,
} from "./config.js";

/**
 * Adott térképnézetben (bounds) látható valódi, beszállásra használható
 * megállók lekérése — ezekből rajzolunk ki saját, mód szerint színezett
 * jelölőket a térképen a Google TransitLayer helyett (az nem stílusozható).
 *
 * A stops-for-location "stop-area" klasztereket (id "CS" előtaggal,
 * locationType 1) is visszaad a nagyobb csomópontoknál — ezeket kihagyjuk,
 * mert nincs saját fizikai helyük, és a fizikai peronok (locationType 0)
 * úgyis megjelennek külön-külön.
 *
 * A fizikai megálló saját "type" mezője csak EGY (nem feltétlenül a
 * legjellemzőbb) módot ad vissza — pl. egy döntően buszos megállót is
 * "TROLLEYBUS"-nak jelölhet, ha egyetlen trolibuszjárat is érinti. Ehelyett a
 * "style.colors" mezőt adjuk vissza, ami az adott megállóban ténylegesen
 * közlekedő ÖSSZES mód hivatalos színét tartalmazza — ebből választ a
 * hívó fél (lásd map.js pickStopColor) prioritás szerint egyetlen ikonszínt.
 * @param {{lat: number, lng: number, latSpan: number, lonSpan: number}} bounds
 * @returns {Promise<Array<{id: string, name: string, lat: number, lon: number, colors: string[]}>>}
 */
export async function getStopsInBounds({ lat, lng, latSpan, lonSpan }) {
  const url = `${BKK_API_BASE}/stops-for-location.json?key=${BKK_API_KEY}&lat=${lat}&lon=${lng}&latSpan=${latSpan}&lonSpan=${lonSpan}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BKK API hiba: ${res.status}`);
  const data = await res.json();
  const stops = data?.data?.list || [];
  return stops
    .filter((s) => s.locationType === 0)
    .map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon, colors: s.style?.colors || [] }));
}

/**
 * Egy megálló következő érkezései.
 * A "where" API a járat- és útvonaladatokat nem közvetlenül a stopTimes
 * bejegyzésekben adja vissza, hanem egy külön "references" blokkban
 * (routeId / tripId alapján kikereshető) — ezért kell mindkettőt visszaadni.
 * A stopTimes bejegyzéseket a kért stopId-ra szűrjük: klaszter-azonosítóknál
 * az API a csoport összes megállójának érkezését
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
 * A route "type" mezője (BUS/TROLLEYBUS/TRAM/…) alapján adjuk meg a
 * járatjelvény színét is, hogy egy vegyes megállóban minden sor a saját
 * módja szerint (busz kék, trolibusz piros, stb.) jelenjen meg.
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
    badgeColor: STOP_TYPE_COLORS[route?.type] || DEFAULT_STOP_COLOR,
    textColor: STOP_TYPE_TEXT_COLORS[route?.type] || DEFAULT_STOP_TEXT_COLOR,
  };
}
