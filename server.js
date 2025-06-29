const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const routes = require('./server/routes');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
// MongoDB connection string
const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));
app.use(express.json());

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    message: 'Server error',
    details: err.message || 'Unknown error'
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Enhanced MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, interval = 5000) => {
  let currentTry = 0;
  
  const tryConnect = async () => {
    try {
      currentTry++;
      console.log(`MongoDB connection attempt ${currentTry} of ${retries}`);
      
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        connectTimeoutMS: 30000,
        retryWrites: true
      });
      
      console.log('Connected to MongoDB successfully!');
      
      // Set up connection error handler
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (mongoose.connection.readyState !== 1) {
          console.log('Connection lost, attempting to reconnect...');
          setTimeout(() => tryConnect(), interval);
        }
      });
      
      // Set up disconnection handler
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, attempting to reconnect...');
        setTimeout(() => tryConnect(), interval);
      });
      
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      
      if (currentTry < retries) {
        console.log(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
        return tryConnect();
      } else {
        console.error(`Failed to connect after ${retries} attempts`);
        return false;
      }
    }
  };
  
  return tryConnect();
};

// Initialize connection
connectWithRetry();

// API Routes
app.use(routes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  // Attempt reconnection if not connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectWithRetry(1, 1000);
    } catch (err) {
      console.error('Failed to reconnect during health check:', err);
    }
  }
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 
              mongoose.connection.readyState === 2 ? 'Connecting' : 
              mongoose.connection.readyState === 0 ? 'Disconnected' : 'Unknown',
      name: mongoose.connection.name || 'Not connected'
    }
  });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server (only if not on Vercel)
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For serverless environment
module.exports = app; 