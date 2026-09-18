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
