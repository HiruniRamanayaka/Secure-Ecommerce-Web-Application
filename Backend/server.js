const express = require('express');
const cors = require('cors');
require("dotenv").config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean'); // lightweight sanitizer for body fields
const compression = require('compression');

//MongoDB connection
const { connectDB } = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

// Routers
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// ---- Security & hardening ----
app.use(helmet({
  crossOriginEmbedderPolicy: false, // prevent issues with fonts/images during dev
}));
app.use(compression());
app.use(express.json({ limit: '16kb' })); // small body limit
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Sanitize request data to prevent NoSQL injection & XSS payloads
app.use(mongoSanitize());
app.use(xssClean());

// Strict CORS: only allow your frontend origin
const allowedOrigin = process.env.FRONTEND_URL || 'https://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Basic rate limiting (tune as needed)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // 200 requests / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
}));

// ---- DB Connection ----
connectDB().catch((err) => {
  // Fail fast if DB connection can't be established
  console.error('Mongo connection failed:', err);
  process.exit(1);
});


// ---- Routes ----
// NOTE: All protected endpoints apply Auth0 JWT check inside route files.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ---- 404 & error handling ----
app.use(notFound);     // Catch unmatched routes
app.use(errorHandler);    // // Handle any thrown errors

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})