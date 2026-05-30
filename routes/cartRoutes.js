const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.viewCart);
router.post('/add-to-cart', cartController.addToCart);
router.post('/checkout', cartController.checkout);

module.exports = router;