const Joi = require('joi');
const User = require('../models/user');

// Return Authenticated User Info
const me = async (req, res) => {
  res.json({ user: req.user });
};

// Admin: list users synced locally, sirted by newest first
const list = async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(200);
    res.json({ items: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { me, list };
