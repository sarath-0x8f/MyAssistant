import { useState, useEffect, useRef, useCallback } from 'react';
import Visualizer from './components/Visualizer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lisa';
  timestamp: Date;
}

const LISA_RESPONSES: Record<string, string> = {
  default: "I'm L.I.S.A., Locomotive's interactive assistant. I can help you learn about our work, connect with our team, or explore career opportunities. What would you like to know?",
  projects: "We've crafted digital experiences for brands like Shopify, Google, Ubisoft, and many more. Our work spans websites, brand systems, and creative content — always with a focus on meaningful, innovative results. Want to explore specific case studies?",
  team: "We're a team of 50+ designers, developers, and strategists based in Montreal, Canada. We believe in deep skill sets, big ideas, lots of heart, and a global reputation. Our culture is built on curiosity, craft, and collaboration.",
  careers: "We're always looking for talented people to join our team. We value creativity, technical excellence, and a passion for digital craft. Whether you're a designer, developer, or strategist — we'd love to hear from you. What role interests you?",
  contact: "I'd love to connect you with the right person. Are you looking to start a project together, explore career opportunities, or something else entirely?",
  services: "We specialize in four core areas:\n\n• Web Design — immersive, high-performance websites\n• Web Development — cutting-edge front-end & back-end\n• Brand Systems — flexible, future-proof identities\n• Creative Content — compelling stories & campaigns\n\nWe're a digital-first design agency with 7 Awwwards Agency of the Year titles.",
  hello: "Hey there! 👋 I'm L.I.S.A. — your guide to all things Locomotive. I can tell you about our projects, our team, career opportunities, or help you get in touch. What interests you?",
  hi: "Hi! Welcome to Locomotive. I'm here to help you navigate our work and connect you with the right people. What can I help you with?",
  thanks: "You're welcome! Feel free to ask me anything else. I'm here to help.",
  award: "We're proud to have won 7 Awwwards Agency of the Year titles, plus multiple Site of the Day and Site of the Month awards. L.I.S.A. herself won a Webby Award for Best Mobile Visual Design in 2026!",
  montreal: "We're based in Montreal, Canada — a city known for its creative energy, bilingual culture, and incredible food. It's the perfect backdrop for a design agency that values both craft and creativity.",
};

function getLisaResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  
  if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio') || lower.includes('case') || lower.includes('client')) {
    return LISA_RESPONSES.projects;
  }
  if (lower.includes('team') || lower.includes('people') || lower.includes('about') || lower.includes('who')) {
    return LISA_RESPONSES.team;
  }
  if (lower.includes('career') || lower.includes('job') || lower.includes('hire') || lower.includes('join') || lower.includes('position')) {
    return LISA_RESPONSES.careers;
  }
  if (lower.includes('contact') || lower.includes('reach') || lower.includes('connect') || lower.includes('email') || lower.includes('talk')) {
    return LISA_RESPONSES.contact;
  }
  if (lower.includes('service') || lower.includes('what do you do') || lower.includes('offer') || lower.includes('specialize')) {
    return LISA_RESPONSES.services;
  }
  if (lower.includes('award') || lower.includes('awwward') || lower.includes('webby') || lower.includes('recognition')) {
    return LISA_RESPONSES.award;
  }
  if (lower.includes('montreal') || lower.includes('where') || lower.includes('location') || lower.includes('office')) {
    return LISA_RESPONSES.montreal;
  }
  if (lower.includes('hello') || lower.includes('hey') || lower.includes('bonjour')) {
    return LISA_RESPONSES.hello;
  }
  if (lower.includes('hi') || lower.includes('sup') || lower.includes("what's up") || lower.includes('yo')) {
    return LISA_RESPONSES.hi;
  }
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('merci')) {
    return LISA_RESPONSES.thanks;
  }
  
  return "That's a great question! While I'm still learning, I can tell you about our projects, services, team, awards, or career opportunities. What would you like to explore?";
}

const SUGGESTIONS = [
  { text: "Tell me about your projects", icon: "✦" },
  { text: "What services do you offer?", icon: "◈" },
  { text: "I'd like to join the team", icon: "◇" },
  { text: "How can I get in touch?", icon: "○" },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting: Message = {
        id: 'greeting',
        text: "Hi, I'm L.I.S.A. — Locomotive's Interactive Super Assistant. I'm here to help you explore our work, connect with our team, or find career opportunities. What would you like to know?",
        sender: 'lisa',
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsListening(true);

    // Simulate LISA thinking
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      setIsTyping(false);
      setIsListening(false);
      setIsSpeaking(true);

      const response = getLisaResponse(messageText);
      const lisaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'lisa',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, lisaMessage]);
      setTimeout(() => setIsSpeaking(false), 1500);
    }, delay);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="lisa-header">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Locomotive Logo Mark */}
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="4" stroke="white" strokeWidth="1.5"/>
                <path d="M7 17V7h2v8h5v2H7z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="logo">Locomotive</div>
              <div className="logo-sub">L.I.S.A.</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="hidden sm:inline">{isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Online'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-[#888] uppercase tracking-wider">
            <a href="https://locomotive.ca/en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Agency</a>
            <a href="https://locomotive.ca/en/work" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Work</a>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="chat-container">
        <div className="messages-area">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`message message-enter ${
                message.sender === 'user' ? 'message-user' : 'message-lisa'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {message.sender === 'lisa' && (
                <div className="flex items-center gap-2 mb-2 opacity-50">
                  <div className="w-4 h-4 rounded-full border border-[#444] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest">L.I.S.A.</span>
                </div>
              )}
              <div className="whitespace-pre-line">{message.text}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message message-lisa message-enter">
              <div className="flex items-center gap-2 mb-2 opacity-50">
                <div className="w-4 h-4 rounded-full border border-[#444] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest">L.I.S.A.</span>
              </div>
              <div className="flex items-center gap-1.5 py-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pb-6 pt-4" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent 100%)'
      }}>
        <div className="input-area">
          {showWelcome && messages.length <= 1 && (
            <div className="suggestions mb-4">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  className="suggestion-chip animate-fade-in"
                  onClick={() => handleSend(suggestion.text)}
                  style={{ animationDelay: `${0.5 + i * 0.1}s`, opacity: 0 }}
                >
                  <span className="mr-2 opacity-50">{suggestion.icon}</span>
                  {suggestion.text}
                </button>
              ))}
            </div>
          )}
          
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="input-field"
              placeholder="Ask L.I.S.A. anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="send-button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 px-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">
              Locomotive Interactive Super Assistant
            </span>
            <span className="text-[10px] text-[#555]">
              {isListening && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Listening
                </span>
              )}
              {isSpeaking && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Responding
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Three.js Visualizer */}
      <Visualizer isListening={isListening} isSpeaking={isSpeaking} />
    </div>
  );
}
