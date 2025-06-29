const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Hardcoded MongoDB connection string
const MONGODB_URI = 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Image Schema
const imageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  imageUrl: String,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  data: Buffer
});

const Image = mongoose.model('Image', imageSchema);

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload route
app.post('/api/upload', upload.single('image'), async (req, res) => {
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
app.get('/api/images/:id', async (req, res) => {
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
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find({}, { data: 0 }); // Exclude binary data
    return res.status(200).json(images);
  } catch (error) {
    console.error('Error getting images:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 