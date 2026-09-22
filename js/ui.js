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

export function openPopup() {
  popup.classList.add("open");
}

export function closePopup() {
  popup.classList.remove("open");
  popupTitle.textContent = "Megálló";
  popupSub.textContent = "";
  popupBody.innerHTML = '<p class="empty-note">Kattints a térképen egy pontra a buszinformációkért.</p>';
}

export function showLoading() {
  popupTitle.textContent = "Keresés...";
  popupSub.textContent = "";
  popupBody.innerHTML = '<p class="empty-note">Legközelebbi megálló keresése…</p>';
  openPopup();
}

export function showError(message) {
  popupTitle.textContent = "Hiba";
  popupBody.innerHTML = `<p class="empty-note">Nem sikerült lekérni az adatokat. (${message})</p>`;
}

export function showNoStopFound() {
  popupTitle.textContent = "Nincs találat";
  popupBody.innerHTML = '<p class="empty-note">A közelben nem található megálló.</p>';
}

export function showStopHeader(stop) {
  popupTitle.textContent = stop.name;
  popupSub.textContent = `Megálló azonosító: ${stop.id}`;
}

export function showActiveStopHeader(stop, label) {
  popupTitle.textContent = stop ? stop.name : "Nincs beállítva megálló";
  popupSub.textContent = stop ? `Aktív: ${label}` : "";
}

export function renderArrivals(rawList, references = {}) {
  if (!rawList.length) {
    popupBody.innerHTML = '<p class="empty-note">A következő órában nincs érkező járat.</p>';
    return;
  }
  const items = rawList.slice(0, MAX_ARRIVALS_SHOWN).map((item) => formatArrival(item, references));
  popupBody.innerHTML = items
    .map(
      (a) => `
      <div class="arrival-row">
        <span class="line-badge">${a.line}</span>
        <span class="dest">${a.destination}</span>
        <span class="eta">${a.minutesUntilArrival} perc</span>
      </div>`
    )
    .join("");
}

export function showMessage(text) {
  popupBody.innerHTML = `<p class="empty-note">${text}</p>`;
}

document.getElementById("popup-close").addEventListener("click", closePopup);
