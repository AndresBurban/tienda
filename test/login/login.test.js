const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Login Selenium', function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async () => {
        await driver.quit();
    });

    it('Debería iniciar sesión correctamente', async () => {
        // Cambia la URL si tu app corre en otro puerto
        await driver.get('http://localhost:3000/login');

        await driver.findElement(By.id('username')).sendKeys('usuarioPrueba');
        await driver.findElement(By.id('password')).sendKeys('contraseñaPrueba');
        await driver.findElement(By.id('loginButton')).click();

        // Espera redirección al dashboard
        await driver.wait(until.urlContains('/dashboard'), 5000);
        const url = await driver.getCurrentUrl();
        expect(url).to.contain('/dashboard');
    });
});