// We keep minimal profile fields; identities/roles are managed by Auth0.
// can sync extra profile fields if needed.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true }, // Auth0 user id (subject)
  email: { type: String, index: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
