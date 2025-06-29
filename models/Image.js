const mongoose = require('mongoose');

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

module.exports = mongoose.model('Image', imageSchema); 