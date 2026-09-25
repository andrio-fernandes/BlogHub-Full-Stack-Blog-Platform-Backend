const mongoose = require("mongoose");

// Reads MONGODB_URI from the .env file (dotenv is loaded in server.js).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Stop the app — it cannot work without a database.
  }
};

module.exports = connectDB;