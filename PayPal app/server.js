const express = require('express');
const path = require('path');
const axios = require('axios');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
require('dotenv').config();

const app = express();

// Register the 'encodeURIComponent' helper
Handlebars.registerHelper('encodeURIComponent', function (context) {
    return encodeURIComponent(context);
});

// Middleware and view engine setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

// PayPal credentials from environment variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_URL = 'https://api.sandbox.paypal.com/v2/checkout/orders';

// Route to create a PayPal payment order
app.post('/api/create-order', async (req, res) => {
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        const response = await axios.post(PAYPAL_API_URL, {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: req.body.productPrice // Product price sent dynamically
                }
            }]
        }, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ orderID: response.data.id });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).send('Server error');
    }
});

// Route for successful payment
app.get('/success', (req, res) => {
    res.send('<h1>Payment Successful!</h1><p>Thank you for your purchase.</p>');
});

// Route for canceled payment
app.get('/cancel', (req, res) => {
    res.send('<h1>Payment Canceled</h1><p>Your transaction was canceled.</p>');
});

// Route for displaying product selection
app.get('/', (req, res) => {
    const products = [
        { id: 1, name: 'Product A', price: 20 },
        { id: 2, name: 'Product B', price: 35 },
        { id: 3, name: 'Product C', price: 50 }
    ];
    res.render('index', { title: 'Product Selection', products });
});

// Route for checkout page
app.get('/checkout', (req, res) => {
    const { productId, productName, productPrice } = req.query;

    if (productId && productName && productPrice) {
        res.render('payment', {
            title: 'Checkout',
            productId,
            productName,
            productPrice,
            paypalClientId: PAYPAL_CLIENT_ID
        });
    } else {
        res.status(400).send('<h1>Invalid Product Details</h1><p>Please go back and select a valid product.</p>');
    }
});

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
