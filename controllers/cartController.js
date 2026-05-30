const db = require('../database');

exports.addToCart = (req, res) => {
    const productId = parseInt(req.body.productId);

    const product = db.prepare(`
        SELECT * FROM products WHERE id = ?
    `).get(productId);

    if (!product || product.stock <= 0) {
        return res.redirect('/');
    }

    const cart = req.session.cart;
    const existing = cart.find(p => p.id === productId);

    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    res.redirect('/cart');
};

exports.viewCart = (req, res) => {
    const cart = req.session.cart;

    const total = cart.reduce((sum, item) =>
        sum + item.price * item.quantity, 0);

    res.render('cart', { cart, total });
};

exports.checkout = (req, res) => {

    if (!req.session.user) {
        return res.redirect('/login');
    }

    const cart = req.session.cart;
    if (cart.length === 0) return res.redirect('/cart');

    const userId = req.session.user.id;

    const transaction = db.transaction(() => {

        // Validar stock nuevamente
        cart.forEach(item => {
            const product = db.prepare(`
                SELECT stock FROM products WHERE id = ?
            `).get(item.id);

            if (!product || product.stock < item.quantity) {
                throw new Error('Stock insuficiente');
            }
        });

        const total = cart.reduce((sum, item) =>
            sum + item.price * item.quantity, 0);

        const order = db.prepare(`
            INSERT INTO orders (user_id, total, created_at)
            VALUES (?, ?, datetime('now'))
        `).run(userId, total);

        const orderId = order.lastInsertRowid;

        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `);

        const updateStock = db.prepare(`
            UPDATE products SET stock = stock - ?
            WHERE id = ?
        `);

        cart.forEach(item => {
            insertItem.run(orderId, item.id, item.quantity, item.price);
            updateStock.run(item.quantity, item.id);
        });

        db.prepare(`
            INSERT INTO audit_logs (user_id, action, created_at)
            VALUES (?, ?, datetime('now'))
        `).run(userId, `Compra realizada. Orden ID: ${orderId}`);
    });

    try {
        transaction();
        req.session.cart = [];
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Error en la compra');
    }
};