// js/settings.js
// Két kedvenc megálló mentése és lekérése. Egyszerű localStorage-alapú
// tárolás — ugyanez a logika (más tárolóval, pl. SharedPreferences) fog
// visszaköszönni a jövőbeli Android verzióban.

const FAVORITE_KEYS = { 1: "gowhen_favorite_1", 2: "gowhen_favorite_2" };

/**
 * @param {1|2} slot
 * @param {{id: string, name: string}} stop
 */
export function saveFavoriteStop(slot, stop) {
  localStorage.setItem(FAVORITE_KEYS[slot], JSON.stringify(stop));
}

/**
 * @param {1|2} slot
 * @returns {{id: string, name: string} | null}
 */
export function getFavoriteStop(slot) {
  return JSON.parse(localStorage.getItem(FAVORITE_KEYS[slot]) || "null");
}
