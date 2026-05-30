const assert = require('assert');
const path = require('path');

/* -------- MOCK DE BASE DE DATOS -------- */

const fakeDb = {
    prepare: function () {
        return {
            get: function () {
                return {
                    id: 1,
                    username: "admin",
                    password: "hashedpassword",
                    role: "admin"
                };
            }
        };
    }
};

/* -------- MOCK DE BCRYPT -------- */

const fakeBcrypt = {
    compareSync: function () {
        return true;
    }
};

/* -------- REEMPLAZAR MODULOS -------- */

const dbPath = path.resolve(__dirname, '../database.js');
require.cache[dbPath] = { exports: fakeDb };

require.cache[require.resolve('bcrypt')] = { exports: fakeBcrypt };

/* -------- IMPORTAR CONTROLADOR -------- */

const authController = require('../../controllers/authController');


describe('Pruebas Login', function () {

    it('Debe iniciar sesión correctamente', function () {

        const req = {
            body: {
                username: "admin",
                password: "1234"
            },
            session: {}
        };

        let redirectUrl = "";

        const res = {
            send: (msg) => msg,
            redirect: (url) => {
                redirectUrl = url;
            }
        };

        authController.login(req, res);

        assert.equal(redirectUrl, "/dashboard");
    });

});