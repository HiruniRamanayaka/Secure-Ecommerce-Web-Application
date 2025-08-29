const express = require('express');
const cors = require('cors');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

//MongoDB connection
const { connectDB } = require('./src/config/db');

// ---- DB Connection ----
connectDB().catch((err) => {
  // Fail fast if DB connection can't be established
  console.error('Mongo connection failed:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})