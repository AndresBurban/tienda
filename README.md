# Tienda - pruebas E2E con Selenium

Instrucciones rápidas para ejecutar las pruebas E2E en Windows (PowerShell):

1. Instalar dependencias:

```powershell
npm install
```

2. Ejecutar las pruebas E2E (headless Chrome):

```powershell
npm run test:e2e
```

Notas:
- Las pruebas usan `selenium-webdriver` y `chromedriver`. Si tu versión de Chrome local no es compatible con la versión de `chromedriver` instalada, actualiza con:

```powershell
npm install chromedriver@^<VERSION> --save-dev
```

- Si deseas ver el navegador en lugar de headless, edita `test/e2e/*.js` y elimina la opción `--headless` en `chrome.Options()`.

- Para ejecutar en CI (GitHub Actions) existe un workflow de ejemplo en `.github/workflows/e2e.yml`.
