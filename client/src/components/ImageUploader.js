import React, { useState } from 'react';
import axios from 'axios';
import './ImageUploader.css';

// Use Vercel deployment URL instead of localhost
const API_URL = 'https://url-to-image-qvplv45ls-fangscripts-projects.vercel.app';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
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

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImage(response.data);
      setUploading(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError('Error uploading image. Please try again.');
      setUploading(false);
      console.error('Upload error:', err);
    }
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
              value={`${API_URL}${uploadedImage.imageUrl}`}
              readOnly
              className="url-input"
            />
            <button
              onClick={() => navigator.clipboard.writeText(`${API_URL}${uploadedImage.imageUrl}`)}
              className="copy-button"
            >
              Copy
            </button>
          </div>
          <img 
            src={`${API_URL}${uploadedImage.imageUrl}`} 
            alt="Uploaded" 
            className="uploaded-image"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 