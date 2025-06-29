// Serverless function for retrieving images by ID
const mongoose = require('mongoose');
const Image = require('../../models/Image');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Get the ID from the URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Image ID is required' });
    }
    
    console.log(`Retrieving image with ID: ${id}`);
    
    // Connect to MongoDB
    try {
      const MONGODB_URI = process.env.MONGODB || 'mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      
      if (mongoose.connection.readyState !== 1) {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
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
    
    // Find the image
    try {
      const image = await Image.findById(id);
      
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // Set content type and return image data
      res.setHeader('Content-Type', image.contentType);
      res.send(image.data);
      
    } catch (findError) {
      console.error('Error finding image:', findError);
      return res.status(500).json({
        message: 'Failed to retrieve image',
        details: findError.message
      });
    }
  } catch (error) {
    console.error('Unexpected error in image retrieval:', error);
    return res.status(500).json({
      message: 'Server error',
      details: error.message || 'Unknown error'
    });
  }
}; 