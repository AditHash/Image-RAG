import React, { useState } from 'react';
// import './App.css';
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
    <div id="root" className="w-screen h-screen min-h-screen min-w-full bg-slate-100 flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-slate-800 mb-12 tracking-tight">Search Images in Natural Language</h1>
        <form onSubmit={handleSearch} className="flex flex-row items-center gap-4 w-full max-w-2xl mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="flex-1 px-5 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm text-lg"
          />
          <button
            type="submit"
            className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition disabled:opacity-60 text-lg"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <form onSubmit={handleUpload} className="flex flex-row items-center gap-4 w-full max-w-2xl mb-8">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:font-semibold file:cursor-pointer file:hover:bg-indigo-600 bg-white text-slate-800 rounded-lg shadow-sm"
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-8 py-3 rounded-lg bg-slate-700 hover:bg-slate-900 text-white font-semibold shadow-sm transition disabled:opacity-60 text-lg"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </form>
        {uploadResult && (
          <div className="text-green-600 font-medium mb-4">
            Uploaded: {uploadResult.results && uploadResult.results.map(r => r.filename).join(', ')}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="text-red-500 mt-2">
                Errors: {uploadResult.errors.map(e => e.filename + ': ' + e.error).join(', ')}
              </div>
            )}
          </div>
        )}
        {error && <div className="text-red-500 font-medium mb-4">{error}</div>}
        <div className="flex flex-wrap gap-8 justify-center w-full max-w-6xl">
          {results.map((res, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center w-[240px] border border-slate-200">
              <img
                src={res.payload && res.payload.filename ? `${backend_url}/images/${res.payload.filename}` : ''}
                alt={res.payload && res.payload.filename ? res.payload.filename : 'result'}
                className="w-52 h-52 object-contain rounded-lg bg-slate-100 mb-4 border border-slate-200"
              />
              <div className="text-center w-full">
                <b className="block text-lg text-slate-700 truncate">{res.payload && res.payload.filename}</b>
                <div className="text-slate-500">Score: {res.score && res.score.toFixed(3)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
