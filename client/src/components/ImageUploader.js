import React, { useState } from 'react';
import axios from 'axios';
import './ImageUploader.css';

// Use relative paths for API endpoints
const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setUploadedImage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setError('');
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading file:', file.name, file.type, file.size);

      // Use relative URL
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Upload response:', response.data);
      setUploadedImage(response.data);
      setUploading(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Upload error details:', err);
      
      let errorMessage = 'Error uploading image. Please try again.';
      
      if (err.response) {
        // The server responded with an error status
        console.error('Server error response:', err.response.data);
        errorMessage = err.response.data.details || err.response.data.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMessage = 'Server did not respond. Please check your connection.';
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', err.message);
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setUploading(false);
    }
  };

  const getFullImageUrl = (path) => {
    return window.location.origin + path;
  };

  return (
    <div className="image-uploader">
      <h2>Upload an Image</h2>
      
      <div className="upload-container">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          Choose Image
        </label>
        
        {preview && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        
        {error && <p className="error-message">{error}</p>}
      </div>
      
      {uploadedImage && (
        <div className="result-container">
          <h3>Upload Successful!</h3>
          <p>Image URL:</p>
          <div className="url-container">
            <input 
              type="text" 
              value={getFullImageUrl(uploadedImage.imageUrl)}
              readOnly
              className="url-input"
            />
            <button
              onClick={() => navigator.clipboard.writeText(getFullImageUrl(uploadedImage.imageUrl))}
              className="copy-button"
            >
              Copy
            </button>
          </div>
          <img 
            src={uploadedImage.imageUrl} 
            alt="Uploaded" 
            className="uploaded-image"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 