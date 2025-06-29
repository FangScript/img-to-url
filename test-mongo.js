const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log(`Connected to database: ${mongoose.connection.name}`);
    
    // Check if the connection is ready
    if (mongoose.connection.readyState === 1) {
      console.log('Connection state: Ready');
    } else {
      console.log(`Connection state: ${mongoose.connection.readyState}`);
    }
    
    // Close connection after test
    await mongoose.connection.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any servers in your MongoDB Atlas cluster.');
      console.error('Please check your connection string and network connectivity.');
    }
    
    process.exit(1);
  }
}

testConnection(); 