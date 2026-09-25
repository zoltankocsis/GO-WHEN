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

// A BKK API-ból érkező szabad szöveget (járat célja, hibaüzenet stb.) sosem
// bízzuk meg — innerHTML-be írás előtt escape-eljük, nehogy egy váratlan
// API-válasz HTML-t/script-et csempésszen a lapba.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

export function openPopup() {
  popup.classList.add("open");
}

export function closePopup() {
  popup.classList.remove("open");
  popupTitle.textContent = "Megálló";
  popupSub.textContent = "";
  popupBody.innerHTML = '<p class="empty-note">Kattints egy megállóikonra a térképen a buszinformációkért.</p>';
}

export function showLoading() {
  popupTitle.textContent = "Betöltés...";
  popupSub.textContent = "";
  popupBody.innerHTML = '<p class="empty-note">Érkezések lekérése…</p>';
  openPopup();
}

export function showError(message, container = popupBody) {
  if (container === popupBody) popupTitle.textContent = "Hiba";
  container.innerHTML = `<p class="empty-note">Nem sikerült lekérni az adatokat. (${escapeHtml(message)})</p>`;
}

export function showStopHeader(stop) {
  popupTitle.textContent = stop.name;
  popupSub.textContent = `Megálló azonosító: ${stop.id}`;
}

/**
 * Érkezési lista kirajzolása egy tetszőleges konténerbe — ugyanez a logika
 * szolgálja ki a jobb oldali "Buszérkezések" popupot és a bal oldali
 * kedvenc-panelek saját listáját is.
 */
export function renderArrivals(rawList, references = {}, container = popupBody) {
  if (!rawList.length) {
    container.innerHTML = '<p class="empty-note">A következő órában nincs érkező járat.</p>';
    return;
  }
  const items = rawList.slice(0, MAX_ARRIVALS_SHOWN).map((item) => formatArrival(item, references));
  container.innerHTML = items
    .map(
      (a) => `
      <div class="arrival-row">
        <span class="line-badge" style="background:${a.badgeColor};color:${a.textColor}">${escapeHtml(a.line)}</span>
        <span class="dest">${escapeHtml(a.destination)}</span>
        <span class="eta">${a.minutesUntilArrival} perc</span>
      </div>`
    )
    .join("");
}

export function showMessage(text, container = popupBody) {
  container.innerHTML = `<p class="empty-note">${escapeHtml(text)}</p>`;
}

document.getElementById("popup-close").addEventListener("click", closePopup);

// --- Kedvenc megálló panelek (bal oldal) ---

function favoriteNameEl(slot) {
  return document.getElementById(`favorite-${slot}-name`);
}

function favoriteArrivalsEl(slot) {
  return document.getElementById(`favorite-${slot}-arrivals`);
}

export function setFavoritePlaceholder(slot) {
  favoriteNameEl(slot).textContent = "Nincs kiválasztva — nyomd meg a gombot, majd kattints egy megállóra a térképen.";
  favoriteArrivalsEl(slot).innerHTML = "";
}

export function setFavoriteStopName(slot, name) {
  favoriteNameEl(slot).textContent = name;
}

export function showFavoriteLoading(slot) {
  favoriteArrivalsEl(slot).innerHTML = '<p class="empty-note">Érkezések lekérése…</p>';
}

export function showFavoriteMessage(slot, text) {
  showMessage(text, favoriteArrivalsEl(slot));
}

export function showFavoriteError(slot, message) {
  showError(message, favoriteArrivalsEl(slot));
}

export function renderFavoriteArrivals(slot, stopTimes, references) {
  renderArrivals(stopTimes, references, favoriteArrivalsEl(slot));
}

export function setPickingState(slot, isPicking) {
  document.querySelectorAll(".favorite-pick-btn").forEach((btn) => {
    const btnSlot = Number(btn.dataset.slot);
    btn.classList.toggle("picking", isPicking && btnSlot === slot);
  });
}
