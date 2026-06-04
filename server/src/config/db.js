const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connect error', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
