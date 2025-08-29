// server/src/controllers/orderController.js

const Joi = require('joi');
const Order = require('../models/order');
const Product = require('../models/product');

// Allow only these districts (example list; extend as required)
const DISTRICTS = ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Anuradhapura', 'Jaffna'];

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(100).required(),
});

const createSchema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required(),
  deliveryDate: Joi.date().required(),
  deliveryTimeSlot: Joi.string().valid('10 AM', '11 AM', '12 PM').required(),
  deliveryDistrict: Joi.string().valid(...DISTRICTS).required(),
  message: Joi.string().max(500).allow(''),
});

const ensureFutureNonSunday = (date) => {
  const d = new Date(date);
  const today = new Date(); today.setHours(0,0,0,0);
  const dd = new Date(d); dd.setHours(0,0,0,0);
  if (dd < today) return 'Delivery date must be today or in the future';
  if (dd.getDay() === 0) return 'Delivery not available on Sundays';
  return null;
};

// Place an Order
const create = async (req, res, next) => {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Validate date rule
    const dateErr = ensureFutureNonSunday(value.deliveryDate);
    if (dateErr) return res.status(400).json({ error: dateErr });

    // Lookup products & snapshot price/name
    const ids = value.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    if (products.length !== ids.length) return res.status(400).json({ error: 'Some products are invalid/unavailable' });

    const items = value.items.map(i => {
      const p = products.find(pp => String(pp._id) === String(i.productId));
      return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });

    const order = await Order.create({
      ownerSub: req.user.sub,
      username: req.user.name || req.user.email || '',
      items,
      deliveryDate: value.deliveryDate,
      deliveryTimeSlot: value.deliveryTimeSlot,
      deliveryDistrict: value.deliveryDistrict,
      message: value.message || '',
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Get Orders for Logged-in User
const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ ownerSub: req.user.sub }).sort({ createdAt: -1 });
    res.json({ items: orders });
  } catch (err) {
    next(err);
  }
};

// Admin: list all orders (with simple pagination)
const listAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required(),
});

// Admin: update order status
const updateStatus = async (req, res, next) => {
  try {
    const { value, error } = updateStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const doc = await Order.findByIdAndUpdate(req.params.id, { status: value.status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Order not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, myOrders, listAll, updateStatus, DISTRICTS };
