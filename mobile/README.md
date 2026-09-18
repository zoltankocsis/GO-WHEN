# mobile/ — jövőbeli Android csomagolás

Ide kerül majd a Capacitor projekt, ami a gyökérben lévő weboldalt
natív Android alkalmazássá (APK) csomagolja.

Tervezett lépések (még nincs elkezdve):

1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap init` — ez a mappa lesz a Capacitor projekt gyökere
3. A `../js/api.js` és `../js/settings.js` fájlok változtatás nélkül
   újrahasználhatók lesznek itt is
4. Natív widget: külön Kotlin modul, ha idáig eljutunk
