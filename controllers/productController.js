const db = require('../database');

exports.listProducts = (req, res) => {
    const products = db.prepare(`
        SELECT * FROM products
    `).all();

    res.render('products', { products });
};

exports.addProduct = (req, res) => {
    const { name, description, price, stock } = req.body;
    db.prepare(`
        INSERT INTO products (name, description, price, stock)
        VALUES (?, ?, ?, ?)
        `).run(name, description, price, stock);

    res.redirect('/products');
};

exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    db.prepare(`
        DELETE FROM products WHERE id = ?
    `).run(id);

    res.redirect('/products');  
};