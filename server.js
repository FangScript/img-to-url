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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Connect to MongoDB with improved options
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
  connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
  retryWrites: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Force database connection before starting app
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
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
      console.log('Database connection forced and established');
    }
  } catch (error) {
    console.error('Force connect to MongoDB failed:', error);
    // Don't throw error - let app start anyway
  }
};

// Call the connect function
connectDB();

// API Routes
app.use(routes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  // Attempt reconnection if not connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
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