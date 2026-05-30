const assert = require('assert');
const path = require('path');

/* -------- MOCK BASE DE DATOS -------- */

const fakeDb = {
    prepare: function (query) {

        if (query.includes("SELECT * FROM products")) {
            return {
                get: function () {
                    return {
                        id: 1,
                        name: "Producto Test",
                        price: 100
                    };
                }
            };
        }

        if (query.includes("INSERT INTO orders")) {
            return {
                run: function () {
                    return { lastInsertRowid: 10 };
                }
            };
        }

        if (query.includes("INSERT INTO order_items")) {
            return {
                run: function () {
                    return true;
                }
            };
        }

        if (query.includes("INSERT INTO audit_logs")) {
            return {
                run: function () {
                    return true;
                }
            };
        }

        return {
            get: () => null,
            run: () => null
        };
    }
};

/* -------- REEMPLAZAR DATABASE -------- */

const dbPath = path.resolve(__dirname, '../database.js');
require.cache[dbPath] = { exports: fakeDb };

/* -------- IMPORTAR CONTROLADOR -------- */    

const checkoutController = require('../../controllers/orderController');

/* -------- PRUEBAS -------- */

describe('Pruebas Checkout', function () {

    it('Debe realizar la compra correctamente', function () {

        const req = {
            session: {
                user: { id: 1 },
                cart: [
                    { productId: 1, quantity: 2 }
                ]
            }
        };

        let mensaje = "";

        const res = {
            send: (msg) => {
                mensaje = msg;
            }
        };

        checkoutController.checkout(req, res);

        assert.equal(mensaje, "Compra realizada con éxito");
        assert.deepEqual(req.session.cart, []);

    });


    it('Debe mostrar carrito vacío', function () {

        const req = {
            session: {
                user: { id: 1 },
                cart: []
            }
        };

        let mensaje = "";

        const res = {
            send: (msg) => {
                mensaje = msg;
            }
        };

        checkoutController.checkout(req, res);

        assert.equal(mensaje, "Carrito vacío");

    });

});