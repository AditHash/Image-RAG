import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const response = await fetch('/query', {
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
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2em', justifyContent: 'center' }}>
        {results.map((res, idx) => (
          <div key={idx} className="card">
            <img
              src={res.payload && res.payload.filename ? `/images/${res.payload.filename}` : ''}
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
