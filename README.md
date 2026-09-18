# GO-WHEN — Busz Most

Élő budapesti buszérkezés-kereső — portfólióprojekt.

## Könyvtárszerkezet

```
GO-WHEN/
├── index.html          → a weboldal váza
├── css/
│   └── style.css       → minden stílus
├── js/
│   ├── config.js       → API-kulcsok, konstansok
│   ├── api.js          → BKK FUTÁR API hívások (nyers adat)
│   ├── settings.js     → Otthon/munkahely mentése (localStorage)
│   ├── ui.js            → felugró kártya, listák megjelenítése
│   └── map.js           → Google Maps inicializálás, kattintás-kezelés
├── assets/              → ikonok, képek (később)
├── mobile/               → helye a jövőbeli Capacitor/Android projektnek
└── README.md
```

## Miért van így szétválasztva

A cél, hogy a `js/` mappában lévő logika (API hívás, mentés, adatfeldolgozás)
később **változtatás nélkül újrahasználható** legyen egy Capacitor-alapú
Android alkalmazásban — csak a `map.js` és `ui.js` fájlokat kell majd
natívabb megjelenítésre cserélni, az `api.js` és `settings.js` mehet tovább.

## Fejlesztési sorrend (terv)

1. Weboldal MVP (jelen állapot)
2. GitHub Pages publikálás (`main` ág, `/ (root)` mappa)
3. Capacitor becsomagolás → APK (a `mobile/` mappában)
4. Natív Android widget (Kotlin, külön fázis)

## Nem hivatalos projekt

Nem a BKK terméke, független fejlesztés a nyilvános FUTÁR API alapján.
