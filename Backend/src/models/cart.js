const mongoose = require('mongoose');

// Represents a single item in the cart.
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, max: 100 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  ownerSub: { type: String, required: true, unique: true },
  items: { type: [cartItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Cart', cartSchema);
