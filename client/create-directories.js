const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const directories = [
  'src/components',
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  } else {
    console.log(`Directory already exists: ${fullPath}`);
  }
}); 