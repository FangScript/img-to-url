const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Image = require('../models/Image');

const router = express.Router();

// Ensure we have a connection before handling requests
const ensureConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000
      });
      console.log('MongoDB connection established in middleware');
      next();
    } catch (error) {
      console.error('Error connecting to MongoDB in middleware:', error);
      return res.status(500).json({ message: 'Database connection error' });
    }
  } else {
    next();
  }
};

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload route
router.post('/api/upload', ensureConnection, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newImage = new Image({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer
    });

    await newImage.save();

    // Create URL for the image
    const imageUrl = `/api/images/${newImage._id}`;
    newImage.imageUrl = imageUrl;
    await newImage.save();

    return res.status(201).json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      imageId: newImage._id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route to get image by ID
router.get('/api/images/:id', ensureConnection, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', image.contentType);
    return res.send(image.data);
  } catch (error) {
    console.error('Error retrieving image:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all images metadata (without binary data)
router.get('/api/images', ensureConnection, async (req, res) => {
  try {
    const images = await Image.find({}, { data: 0 }); // Exclude binary data
    return res.status(200).json(images);
  } catch (error) {
    console.error('Error getting images:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
router.get('/api/healthcheck', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    let dbStatus;
    
    switch (dbState) {
      case 0: dbStatus = 'Disconnected'; break;
      case 1: dbStatus = 'Connected'; break;
      case 2: dbStatus = 'Connecting'; break;
      case 3: dbStatus = 'Disconnecting'; break;
      default: dbStatus = 'Unknown';
    }

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'Not connected'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({ 
      status: 'error',
      message: 'Service unavailable'
    });
  }
});

module.exports = router; 