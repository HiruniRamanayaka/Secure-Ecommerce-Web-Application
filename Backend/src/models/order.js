const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },        // snapshot of product name
  price: { type: Number, required: true, min: 0 },// snapshot of product price
  quantity: { type: Number, required: true, min: 1, max: 100 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  ownerSub: { type: String, required: true, index: true }, // Auth0 user ID (subject)
  username: { type: String, default: '' },                 // snapshot (for display)
  items: { type: [orderItemSchema], required: true },

  deliveryDate: { type: Date, required: true },            // >= today; not Sunday
  deliveryTimeSlot: { type: String, enum: ['10 AM', '11 AM', '12 PM'], required: true },
  deliveryDistrict: { type: String, required: true },
  message: { type: String, default: '' },

  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },

  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Order', orderSchema);
