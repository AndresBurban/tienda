const db = require('../database');

exports.checkout = (req, res) => {
    const cart = req.session.cart;
    if (!cart || cart.length === 0)
        return res.send("Carrito vacío");

    const total = cart.reduce((sum, item) => {
        const product = db.prepare("SELECT * FROM products WHERE id=?")
            .get(item.productId);
        return sum + product.price * item.quantity;
    }, 0);

    const order = db.prepare(`
        INSERT INTO orders (user_id, total, created_at)
        VALUES (?, ?, datetime('now'))
    `).run(req.session.user.id, total);

    cart.forEach(item => {
        const product = db.prepare("SELECT * FROM products WHERE id=?")
            .get(item.productId);

        db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `).run(order.lastInsertRowid, product.id, item.quantity, product.price);
    });

    db.prepare(`
        INSERT INTO audit_logs (user_id, action, created_at)
        VALUES (?, ?, datetime('now'))
    `).run(req.session.user.id, "Realizó una compra");

    req.session.cart = [];
    res.send("Compra realizada con éxito");
};