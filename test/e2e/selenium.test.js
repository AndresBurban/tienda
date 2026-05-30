const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let chromedriverPath = null;
let chromedriverModule = null;
try {
  chromedriverModule = require('chromedriver');
  chromedriverPath = chromedriverModule.path || chromedriverModule;
} catch (e) {
  // will handle absence later
}
const assert = require('assert');
const path = require('path');

describe('E2E con Selenium', function () {
  this.timeout(90000);

  let server;
  let driver;
  let createdProductId = null;
  before(async function () {
    // Iniciar servidor (arrancar nueva instancia usando app.listen para evitar problemas con cache)
    const app = require('../../app');
    server = app.listen(3000, () => console.log('Servidor en http://localhost:3000'));

    // Asegurar que exista al menos un producto en la DB para el test
    try {
      const db = require('../../database');
      const row = db.prepare('SELECT * FROM products LIMIT 1').get();
      if (!row) {
        const info = db.prepare('INSERT INTO products (name, description, price, stock) VALUES (?,?,?,?)')
          .run('Producto E2E', 'Creado para pruebas E2E', 9.99, 10);
        // lastInsertRowid is the id
        createdProductId = info.lastInsertRowid || info.lastID || null;
        console.log('Producto de prueba insertado en DB, id=', createdProductId);
      } else {
        console.log('Ya existe al menos un producto en DB, id=', row.id);
      }
    } catch (err) {
      console.warn('No se pudo acceder a la DB para seed:', err && err.message ? err.message : err);
    }

    // Opciones simples para Chrome
    const options = new chrome.Options();
    // Ejecutar en headless por defecto para entornos CI/servidores sin GUI
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

    // Si instalaste el paquete chromedriver, configúralo explícitamente
    let builder = new Builder().forBrowser('chrome').setChromeOptions(options);

    if (chromedriverPath) {
      try {
        const serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);
        builder = builder.setChromeService(serviceBuilder);
        console.log('Chromedriver service configurado en:', chromedriverPath);
      } catch (err) {
        console.error('Error configurando chromedriver service:', err && err.stack ? err.stack : err);
      }
    } else {
      console.warn('Módulo chromedriver no encontrado; confiando en ChromeDriver del PATH.');
    }

    try {
      driver = await builder.build();
      console.log('WebDriver creado correctamente');
    } catch (err) {
      console.error('Error al crear el WebDriver:', err && err.stack ? err.stack : err);
      // Cerrar servidor si hay error
      if (server && server.close) server.close();
      throw err;
    }
  });

  after(async function () {
    if (driver) await driver.quit();
    if (server && server.close) server.close();
    // Limpiar producto creado por el test si aplica
    if (createdProductId) {
      try {
        const db = require('../../database');
        db.prepare('DELETE FROM products WHERE id = ?').run(createdProductId);
        console.log('Producto de prueba eliminado, id=', createdProductId);
      } catch (err) {
        console.warn('No se pudo eliminar producto de prueba:', err && err.message ? err.message : err);
      }
    }
  });

  it('Carga la página principal y agrega un producto al carrito', async function () {
    await driver.get('http://localhost:3000/');

    // Esperar que el H1 esté presente
    const h1 = await driver.wait(until.elementLocated(By.css('h1')), 5000);
    const h1Text = await h1.getText();
    assert.strictEqual(h1Text, 'Tienda');

    // Buscar el primer botón "Agregar"
    const addButton = await driver.findElement(By.css('form button'));
    await addButton.click();

    // Después de agregar, esperar a que la URL cambie a /cart
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/cart');
    }, 10000);

    // En la página /cart el H1 debe ser 'Carrito'
    const cartH1 = await driver.wait(until.elementLocated(By.css('h1')), 5000);
    const cartH1Text = await cartH1.getText();
    assert.strictEqual(cartH1Text, 'Carrito');
  });
});
