import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Image URL Generator</h1>
        <p>Upload an image and get a shareable URL</p>
      </header>
      <main>
        <ImageUploader />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Image URL Generator</p>
      </footer>
    </div>
  );
}

export default App; 