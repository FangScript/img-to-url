// Serverless function for health check
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Check MongoDB connection if possible
  let dbStatus = 'Not checked';
  let dbError = null;
  
  try {
    if (mongoose.connection && mongoose.connection.readyState !== undefined) {
      switch (mongoose.connection.readyState) {
        case 0: dbStatus = 'Disconnected'; break;
        case 1: dbStatus = 'Connected'; break;
        case 2: dbStatus = 'Connecting'; break;
        case 3: dbStatus = 'Disconnecting'; break;
        default: dbStatus = 'Unknown';
      }
    } else {
      // Try to connect
      try {
        const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000 // Short timeout for health check
        });
        dbStatus = 'Connected';
      } catch (connErr) {
        dbStatus = 'Connection failed';
        dbError = connErr.message;
      }
    }
  } catch (err) {
    dbStatus = 'Error checking connection';
    dbError = err.message;
  }
  
  // Basic health check response
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'url-to-image-api',
    database: {
      status: dbStatus,
      error: dbError
    },
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage()
    }
  });
}; 