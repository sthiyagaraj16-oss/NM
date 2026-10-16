const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured. The API cannot start without MongoDB.");
  }

  try {
    mongoose.set("bufferCommands", false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;