const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

// Inicializar carrito y variables globales
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }

    res.locals.user = req.session.user || null;
    res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);

    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(require('./routes/authRoutes'));
app.use(require('./routes/productRoutes'));
//app.use(require('./routes/orderRoutes'));
app.use(require('./routes/cartRoutes'));


// Exportamos la app para que los tests puedan iniciarla y detenerla.
module.exports = app;