const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true); // safer queries
  await mongoose.connect(uri, { autoIndex: true });
  console.log('MongoDB connected');
};

module.exports = { connectDB };
