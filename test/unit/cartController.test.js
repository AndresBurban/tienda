   
   /* ANDRES ALIRIO BURBANO SOLARTE */

   const assert = require('assert');
    const path = require('path');


const fakeDb = {
    prepare: function () {
        return {
            get: function () {
                return {
                    id: 1,
                    name: "Producto Test",
                    price: 100,
                    stock: 5
                };
            }
        };
    }
};


const dbPath = path.resolve(__dirname, '../../database.js');

require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: fakeDb
};


const cartController = require('../../controllers/cartController');


const req = {
    body: { productId: "1" },
    session: { cart: [] }
};

const res = {
    redirectedTo: null,
    redirect: function (url) {
        this.redirectedTo = url;
    }
};


cartController.addToCart(req, res);


try {
    assert.strictEqual(req.session.cart.length, 1);
    assert.strictEqual(req.session.cart[0].quantity, 1);
    assert.strictEqual(res.redirectedTo, '/cart');

    console.log("✅ Test addToCart PASÓ correctamente");
} catch (error) {
    console.error("❌ Test addToCart FALLÓ");
    console.error(error.message);
}