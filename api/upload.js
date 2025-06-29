// Serverless function for file uploads
const mongoose = require('mongoose');
const multer = require('multer');
const Image = require('../models/Image');

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Process the upload as middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    console.log('Upload request received in serverless function');
    
    // Process the file upload
    try {
      await runMiddleware(req, res, upload.single('image'));
    } catch (uploadError) {
      console.error('Upload processing error:', uploadError);
      return res.status(400).json({ 
        message: 'File upload failed',
        details: uploadError.message
      });
    }
    
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log(`File received: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    // Connect to MongoDB
    try {
      const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      
      if (mongoose.connection.readyState !== 1) {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000
        });
        console.log('Connected to MongoDB');
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        message: 'Database connection failed',
        details: dbError.message
      });
    }
    
    // Save the image
    try {
      console.log('Creating new image document');
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
      
      console.log('Image saved successfully with ID:', newImage._id);
      
      return res.status(201).json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        imageId: newImage._id
      });
    } catch (saveError) {
      console.error('Error saving image:', saveError);
      return res.status(500).json({
        message: 'Failed to save image',
        details: saveError.message
      });
    }
  } catch (error) {
    console.error('Unexpected error in upload handler:', error);
    return res.status(500).json({
      message: 'Server error',
      details: error.message || 'Unknown error'
    });
  }
}; 