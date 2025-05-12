import { useState, useEffect, useRef } from "react";
import "./App.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

// Add your Google API key here
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);

function App() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Add your Model ID here
      const model = genAI.getGenerativeModel({
        model: process.env.REACT_APP_MODEL,
      });

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = await response.text();

      setMessages((prev) => [...prev, { from: "bot", text }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't understand that." },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4 text-primary fw-bold">Gemini Chatbot</h2>
      <div
        className="border rounded p-3 mb-3 bg-light shadow-sm"
        style={{ height: "400px", overflowY: "auto" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 d-flex ${
              msg.from === "user"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-3 ${
                msg.from === "user"
                  ? "bg-primary text-white"
                  : "bg-white border text-dark"
              }`}
              style={{ maxWidth: "75%" }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="d-flex justify-content-start">
            <div className="px-3 py-2 rounded-3 bg-white border text-muted typing">
              Typing<span className="dots">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-group shadow-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
