const mongoose = require('mongoose');
const Image = require('./models/Image');

async function checkMongoUsage() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected successfully!');
    
    // Get all images
    const images = await Image.find({});
    console.log(`Found ${images.length} images in the database`);
    
    // Calculate total size
    let totalSize = 0;
    for (const image of images) {
      if (image.data) {
        totalSize += image.data.length || 0;
      }
    }
    
    console.log(`Total storage used by images: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log('MongoDB Atlas Free Tier limit is 512 MB');
    
    // List the largest images
    const imagesWithSize = images.map(img => ({
      id: img._id,
      filename: img.filename,
      size: img.data ? (img.data.length / (1024 * 1024)).toFixed(2) : 0,
      date: img.uploadDate
    }));
    
    imagesWithSize.sort((a, b) => b.size - a.size);
    
    console.log('\nLargest images:');
    imagesWithSize.slice(0, 5).forEach(img => {
      console.log(`${img.filename}: ${img.size} MB (uploaded: ${img.date})`);
    });
    
  } catch (error) {
    console.error('Error checking MongoDB usage:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkMongoUsage(); 