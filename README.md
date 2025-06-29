# Image Upload to MongoDB with URL Generator

A simple web application that allows users to upload images to MongoDB and get a shareable URL for the uploaded image.

## Features

* Drag and drop or click to upload images
* Progress bar to track upload status
* Image preview after successful upload
* Copy image URL to clipboard
* Gallery of previously uploaded images
* Responsive design

## Technologies Used

* HTML, CSS, and JavaScript for the front-end
* React.js for the UI components
* Node.js and Express for the back-end
* MongoDB for image storage
* Multer for handling file uploads

## Prerequisites

* Node.js (v14 or higher)
* MongoDB (local or Atlas)

## Installation and Setup

1. Clone the repository:  
```  
git clone https://github.com/FangScript/img-to-url.git  
cd img-to-url  
```
2. Install dependencies:  
```  
npm install  
```
3. Create a `.env` file in the root directory with the following variables:  
```  
PORT=3000  
MONGODB=mongodb+srv://fangscript:shani1319@cluster0.ug4pojo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0  
BASE_URL=http://localhost:3000  
```  
Note: If you're using a different MongoDB instance, replace the MONGODB with your connection string.
4. Start the server:  
```  
npm start  
```  
For development with auto-restart:  
```  
npm run dev  
```
5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click on the upload area or drag an image file onto it
2. Click the "Upload Image" button
3. Once the upload is complete, you'll see a preview of your image and a URL
4. Click the "Copy" button to copy the URL to your clipboard
5. Use the "Upload Another" button to upload more images

## API Endpoints

* `POST /api/upload` - Upload an image
* `GET /api/images/:id` - Get a specific image by ID
* `GET /api/images` - Get metadata for all uploaded images
* `GET /api/healthcheck` - Health check endpoint to verify connection status

## Deployment

This application is configured for deployment to Vercel. See the Deployment Guide section in the original repository for detailed instructions.

## License

This project is licensed under the MIT License. 