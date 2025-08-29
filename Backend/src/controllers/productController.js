const Joi = require('joi');          // Used to validate incoming product data before saving to the database.
const Product = require('../models/product');

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).allow(''),
  price: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().allow(''),
  category: Joi.string().trim().max(60).default('coffee'),
  stock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

// Validates the request body. If valid, creates a new product in MongoDB. Returns the created product with status 201 Created.
const create = async (req, res, next) => {
  try {
    const { value, error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const doc = await Product.create(value);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// Supports search (q), pagination (page, limit)
const list = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (q) filter.name = { $regex: String(q), $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// Finds a product by its ID
const getOne = async (req, res, next) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc || !doc.isActive) return res.status(404).json({ error: 'Product not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// Updates the product by ID
const update = async (req, res, next) => {
  try {
    const { value, error } = productSchema.validate(req.body, { presence: 'optional' });
    if (error) return res.status(400).json({ error: error.message });
    const doc = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// Deletes the product by ID
const remove = async (req, res, next) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
