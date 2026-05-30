const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let chromedriverPath = null;
try { chromedriverPath = require('chromedriver').path; } catch (e) {}
const assert = require('assert');

describe('E2E Checkout como invitado', function () {
  this.timeout(90000);

  let server;
  let driver;
  let createdProductId = null;

  before(async function () {
  const app = require('../../app');
  server = app.listen(3000, () => console.log('Servidor en http://localhost:3000'));

    // Seed producto si es necesario
    try {
      const db = require('../../database');
      const row = db.prepare('SELECT * FROM products LIMIT 1').get();
      if (!row) {
        const info = db.prepare('INSERT INTO products (name, description, price, stock) VALUES (?,?,?,?)')
          .run('Producto Checkout E2E', 'Creado para checkout E2E', 5.99, 5);
        createdProductId = info.lastInsertRowid || info.lastID || null;
        console.log('Producto checkout insertado, id=', createdProductId);
      }
    } catch (err) {
      console.warn('Seed DB failed:', err && err.message ? err.message : err);
    }

    const options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

    let builder = new Builder().forBrowser('chrome').setChromeOptions(options);
    if (chromedriverPath) builder = builder.setChromeService(new chrome.ServiceBuilder(chromedriverPath));

    driver = await builder.build();
  });

  after(async function () {
    if (driver) await driver.quit();
    if (server && server.close) server.close();
    if (createdProductId) {
      try { const db = require('../../database'); db.prepare('DELETE FROM products WHERE id = ?').run(createdProductId); } catch (e) {}
    }
  });

  it('Intentar finalizar compra como invitado redirige a /login', async function () {
    // Añadir al carrito
    await driver.get('http://localhost:3000/');
    const addButton = await driver.wait(until.elementLocated(By.css('form button')), 5000);
    await addButton.click();

    // Ir al carrito
    await driver.get('http://localhost:3000/cart');

    // Pulsar 'Finalizar Compra' (si hay items)
    const checkoutButton = await driver.findElement(By.css('form[action="/checkout"] button'));
    await checkoutButton.click();

    // Esperar que la URL incluya /login (redirección)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/login');
    }, 5000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'));
  });
});
