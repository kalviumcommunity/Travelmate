import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from the API');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <h1 className="header-title">TravelMate</h1>
        <p className="header-subtitle">Your Smart Travel Companion</p>

        <form onSubmit={handleSubmit} className="travel-form">
          <textarea
            className="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Suggest a 5-day trip to Paris for a student on a low budget."
          />
          <button
            type="submit"
            className="generate-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {!response && !error && !loading && (
          <div className="placeholder">
            <p className="placeholder-text">
              Project setup is complete. The next PR will add functionality.
            </p>
          </div>
        )}

        {response && (
          <div className="response-container">
            <h2 className="response-title">Your Travel Plan:</h2>
            <p className="response-text">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
