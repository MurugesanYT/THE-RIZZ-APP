import React, { useState, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
    import * as localforage from 'localforage';
    import { GoogleGenerativeAI } from "@google/generative-ai";
    
    function App() {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<ApiKeySetup />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </Router>
      );
    }
    
    function ApiKeySetup() {
      const [apiKey, setApiKey] = useState('');
      const [error, setError] = useState('');
      const navigate = useNavigate();
    
      useEffect(() => {
        const fetchApiKey = async () => {
          const storedKey = await localforage.getItem('geminiApiKey');
          if (storedKey) {
            setApiKey(storedKey);
          }
        };
        fetchApiKey();
      }, []);
    
      const validateApiKey = async () => {
        if (!apiKey) {
          setError('API key is required.');
          return;
        }
    
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          await model.generateContent("test");
          await localforage.setItem('geminiApiKey', apiKey);
          navigate('/chat');
        } catch (err) {
          console.error("API Key Validation Error:", err);
          setError('Invalid API key.');
        }
      };
    
      return (
        <div className="container">
          <h1>API Key Setup</h1>
          <div className="api-key-container">
            <input
              type="text"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button onClick={validateApiKey}>Save & Validate</button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      );
    }
    
    function ChatInterface() {
      const [prompt, setPrompt] = useState('');
      const [response, setResponse] = useState('');
      const [error, setError] = useState('');
      const [apiKey, setApiKey] = useState('');
    
      useEffect(() => {
        const fetchApiKey = async () => {
          const storedKey = await localforage.getItem('geminiApiKey');
          if (storedKey) {
            setApiKey(storedKey);
          }
        };
        fetchApiKey();
      }, []);
    
      const generateRizz = async () => {
        if (!prompt) {
          setError('Please enter a prompt.');
          return;
        }
    
        if (!apiKey) {
          setError('API key not found. Please set it up first.');
          return;
        }
    
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          setResponse(text);
          setError('');
        } catch (err) {
          console.error("Gemini API Error:", err);
          setError('Error generating response. Please check your API key and try again.');
          setResponse('');
        }
      };
    
      return (
        <div className="container">
          <h1>Rizz Generator</h1>
          <label>Enter your prompt:</label>
          <textarea
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Give me a pickup line for a girl who likes coding'"
          />
          <button onClick={generateRizz}>Generate Rizz</button>
          {error && <p className="error">{error}</p>}
          {response && (
            <div className="response">
              <p>{response}</p>
            </div>
          )}
        </div>
      );
    }
    
    export default App;
