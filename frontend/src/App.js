import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null); // can be object OR string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sliders state
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);

  // NEW: Foodie focus checkbox
  const [isFoodie, setIsFoodie] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // send all states
        body: JSON.stringify({ prompt, temperature, topP, isFoodie }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch from the API');
      }

      setResponse(data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // helper check → is structured?
  const isStructured = (res) =>
    res &&
    (res.places || res.transport || res.food || res.stay);

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

          {/* NEW: Foodie Checkbox */}
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="foodie-focus"
              checked={isFoodie}
              onChange={(e) => setIsFoodie(e.target.checked)}
              className="focus-checkbox"
            />
            <label htmlFor="foodie-focus" className="checkbox-label">
              Extra Focus on Food & Cuisine
            </label>
          </div>

          {/* Controls for sliders */}
          <div className="controls-grid">
            <div>
              <label htmlFor="temp" className="slider-label">
                Creativity (Temperature): {temperature}
              </label>
              <input
                type="range"
                id="temp"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>

            <div>
              <label htmlFor="topp" className="slider-label">
                Diversity (Top P): {topP}
              </label>
              <input
                type="range"
                id="topp"
                min="0"
                max="1"
                step="0.1"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
          </div>

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

        {/* Structured Display */}
        {response && isStructured(response) && (
          <div className="results-grid">
            {response.places && (
              <div className="result-card">
                <h3>📍 Places to Visit</h3>
                <ul>
                  {response.places.map((place, index) => (
                    <li key={index}>{place}</li>
                  ))}
                </ul>
              </div>
            )}
            {response.transport && (
              <div className="result-card">
                <h3>🚗 Transportation</h3>
                <p>{response.transport}</p>
              </div>
            )}
            {response.food && (
              <div className="result-card">
                <h3>🍔 Food & Cuisine</h3>
                <ul>
                  {response.food.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {response.stay && (
              <div className="result-card">
                <h3>🏨 Accommodation</h3>
                <p>{response.stay}</p>
              </div>
            )}
          </div>
        )}

        {/* Fallback Text Response */}
        {response && !isStructured(response) && (
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
