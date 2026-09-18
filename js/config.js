// js/config.js
// Ide kerülnek a saját API-kulcsok. Ez a fájl a jövőben (Capacitor build)
// is változtatás nélkül újrahasználható lesz.

export const BKK_API_KEY = "781a4ae8-666b-44b6-b404-6ea65fe28aca"; // https://opendata.bkk.hu
export const BKK_API_BASE = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where";
export const GOOGLE_MAPS_API_KEY = "AIzaSyAX-q8IALXYLb4Lb63V445EAYFc5Tfhh3I"; // console.cloud.google.com

export const BUDAPEST_CENTER = { lat: 47.4979, lng: 19.0402 };
export const DEFAULT_ZOOM = 13;
export const NEAREST_STOP_RADIUS_M = 400;
export const ARRIVALS_MINUTES_AHEAD = 60;
export const MAX_ARRIVALS_SHOWN = 6;

// Napszak szerinti váltás: melyik órák között legyen a "munkahelyi" aktív
export const WORK_HOURS_START = 6;
export const WORK_HOURS_END = 15;
