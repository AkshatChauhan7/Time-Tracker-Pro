import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const AiCoachModal = ({ tasks, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    const simplifiedTasks = tasks.map(({ title, timeSpent, createdAt, completed }) => ({
      title,
      durationMinutes: Math.round(timeSpent / 60000),
      date: createdAt.slice(0, 10),
      completed,
    }));
    
    const taskDataString = JSON.stringify(simplifiedTasks, null, 2);

    const fullPrompt = `
      You are a professional productivity coach. Analyze the following time tracking data and answer the user's question. 
      The data is in JSON format. Each object represents a task. 'durationMinutes' is the time spent on the task.
      Provide a concise, insightful, and helpful response formatted in Markdown.

      User's Question: "${prompt}"

      My Time Tracking Data:
      \`\`\`json
      ${taskDataString}
      \`\`\`
    `;

    try {
        const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
        
        // **THE FIX: Added a generationConfig to the payload**
        const payload = { 
          contents: chatHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        };
        
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
          throw new Error("API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (!res.ok) {
            // Provide a more detailed error from the API response if available
            const errorMsg = result?.error?.message || `API request failed with status: ${res.status}`;
            throw new Error(errorMsg);
        }

        if (!result.candidates || result.candidates.length === 0) {
            if (result.promptFeedback && result.promptFeedback.blockReason) {
                throw new Error(`Request was blocked. Reason: ${result.promptFeedback.blockReason}.`);
            } else {
                throw new Error("The AI returned an empty response.");
            }
        }
        
        const text = result.candidates[0]?.content?.parts?.[0]?.text;

        if (text) {
            setResponse(text);
        } else {
            throw new Error("Received an invalid response structure from the AI.");
        }

    } catch (err) {
      setError(err.message || 'Sorry, something went wrong. Please try again.');
      console.error("AI Coach Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h2>Productivity Coach</h2>
          <button onClick={onClose} className="ai-modal-close-btn">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="ai-response-area">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <p style={{ color: '#dc2626', fontWeight: '500' }}>{error}</p>
          ) : response ? (
            <ReactMarkdown>{response}</ReactMarkdown>
          ) : (
            <p>Ask a question about your productivity, like "How can I be more focused?" or "Summarize my work this week."</p>
          )}
        </div>

        <div className="ai-input-area">
          <input
            type="text"
            className="form-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask Gemini..."
            disabled={isLoading}
          />
          <button className="btn btn-primary" onClick={handleAsk} disabled={isLoading || !prompt}>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiCoachModal;
