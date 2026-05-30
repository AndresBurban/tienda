const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const app = require('../../app');

describe('Login Selenium', function () {
    this.timeout(30000);

    let driver;
    let server;

    before(async () => {
        server = app.listen(3000);
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async () => {
        await driver.quit();
        await server.close();
    });

    it('Debería iniciar sesión correctamente', async () => {
        await driver.get('http://localhost:3000/login');

        await driver.findElement(By.id('username')).sendKeys('usuarioPrueba');
        await driver.findElement(By.id('password')).sendKeys('contraseñaPrueba');
        await driver.findElement(By.id('loginButton')).click();

        await driver.wait(until.urlContains('/dashboard'), 5000);

        const url = await driver.getCurrentUrl();
        expect(url).to.contain('/dashboard');
    });
});
