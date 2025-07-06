import React, { useState } from 'react';
import './App.css';
import { backend_url } from './constant/constant.jsx';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const response = await fetch(`${backend_url}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setUploading(true);
    setUploadResult(null);
    setError('');
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      const response = await fetch(`${backend_url}/embed`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setUploadResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="root">
      <h1>Image Search</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: '2em' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter your search query..."
          style={{ width: '300px', padding: '0.5em' }}
        />
        <button type="submit" style={{ marginLeft: '1em', padding: '0.5em 1em' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <form onSubmit={handleUpload} style={{ marginBottom: '2em' }}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ marginRight: '1em' }}
        />
        <button type="submit" disabled={uploading} style={{ padding: '0.5em 1em' }}>
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </form>
      {uploadResult && (
        <div style={{ color: 'green', marginBottom: '1em' }}>
          Uploaded: {uploadResult.results && uploadResult.results.map(r => r.filename).join(', ')}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div style={{ color: 'red' }}>
              Errors: {uploadResult.errors.map(e => e.filename + ': ' + e.error).join(', ')}
            </div>
          )}
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2em', justifyContent: 'center' }}>
        {results.map((res, idx) => (
          <div key={idx} className="card">
            <img
              src={res.payload && res.payload.filename ? `${backend_url}/images/${res.payload.filename}` : ''}
              alt={res.payload && res.payload.filename ? res.payload.filename : 'result'}
              style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', background: '#f0f0f0' }}
            />
            <div style={{ marginTop: '1em' }}>
              <b>{res.payload && res.payload.filename}</b>
              <div>Score: {res.score && res.score.toFixed(3)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
