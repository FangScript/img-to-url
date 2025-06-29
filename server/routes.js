const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Image = require('../models/Image');

const router = express.Router();

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload route
router.post('/api/upload', upload.single('image'), async (req, res) => {
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
router.get('/api/images/:id', async (req, res) => {
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
router.get('/api/images', async (req, res) => {
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