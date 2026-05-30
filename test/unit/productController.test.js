const assert = require("assert");
const path = require("path");

/* -------- MOCK DE BASE DE DATOS -------- */

const fakeDb = {
  prepare: function (query) {

    if (query.includes("SELECT * FROM products")) {
      return {
        all: () => [
          { id: 1, name: "Producto 1", price: 100, stock: 10 },
          { id: 2, name: "Producto 2", price: 200, stock: 5 }
        ]
      };
    }

    if (query.includes("INSERT INTO products")) {
      return {
        run: () => true
      };
    }

    if (query.includes("DELETE FROM products")) {
      return {
        run: () => true
      };
    }

    return {
      all: () => [],
      run: () => null
    };
  }
};

/* -------- REEMPLAZAR DATABASE -------- */

const dbPath = path.resolve(__dirname, "../../database.js");
require.cache[dbPath] = { exports: fakeDb };

/* -------- IMPORTAR CONTROLADOR -------- */

const productController = require("../../controllers/productController");

/* -------- PRUEBAS -------- */

describe("Product Controller", () => {

  it("Debe listar productos", () => {

    const req = {};

    let view = "";
    let data = null;

    const res = {
      render: (viewName, obj) => {
        view = viewName;
        data = obj;
      }
    };

    productController.listProducts(req, res);

    assert.equal(view, "products");
    assert.ok(data.products.length > 0);

  });


  it("Debe agregar producto", () => {

    const req = {
      body: {
        name: "Producto Test",
        description: "Descripción",
        price: 50,
        stock: 3
      }
    };

    let redirectUrl = "";

    const res = {
      redirect: (url) => {
        redirectUrl = url;
      }
    };

    productController.addProduct(req, res);

    assert.equal(redirectUrl, "/products");

  });


  it("Debe eliminar producto", () => {

    const req = {
      params: { id: 1 }
    };

    let redirectUrl = "";

    const res = {
      redirect: (url) => {
        redirectUrl = url;
      }
    };

    productController.deleteProduct(req, res);

    assert.equal(redirectUrl, "/products");

  });

});