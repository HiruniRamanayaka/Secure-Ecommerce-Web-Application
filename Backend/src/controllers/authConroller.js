// Returns the authenticated user's profile based on token claims.
// Optionally syncs a basic user record in Mongo (no secrets, no passwords here).

const Joi = require('joi');
const User = require('../models/user');

const profile = async (req, res, next) => {
  try {
    const { sub, email, name } = req.user || {};
    if (!sub) return res.status(401).json({ error: 'Unauthorized' });    //- If there's no sub, the user is not authenticated — return a 401 error.

    // Upsert (update or insert) minimal profile (safe fields only)
    await User.updateOne(
      { sub },
      { $set: { email: email || '', name: name || '' } },
      { upsert: true }
    );

    res.json({ user: { sub, email, name, roles: req.user.roles || [] } });        // Returns the user profile as JSON, including their roles.
  } catch (err) {
    next(err);          //Passes any errors to Express’s error handler.
  }
};

// Validate a token is ok (useful for client sanity checks)
const validateToken = async (req, res) => {
  res.json({ valid: true, sub: req.user.sub, roles: req.user.roles || [] });           
};

module.exports = { profile, validateToken };
