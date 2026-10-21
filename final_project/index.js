
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Customer session middleware
app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

// JWT authentication for protected customer routes
app.use('/customer/auth/*', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token required'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'bookshop_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  });
});

// Customer routes: registration and login
app.use('/customer', customer_routes);

// Public book routes
app.use('/', genl_routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
