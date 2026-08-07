"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Volume2, VolumeX, Sparkles } from 'lucide-react';

type Message = {
  id: string;
  role: 'USER' | 'AI';
  content: string;
};

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [depth, setDepth] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [model, setModel] = useState<'gemini' | 'openai'>('gemini');
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'AI',
      content: 'Hi! I am KAIRO. What are we focusing on today? We can dive into System Design, debug some code, or prepare for interviews.',
    }
  ]);

  const speakText = (text: string) => {
    if (!voiceOutput || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`]/g, '').replace(/http\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    const userMessage: Message = { id: Date.now().toString(), role: 'USER', content: userMsgText };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          depth,
          model
        })
      });

      const data = await response.json();
      const aiReplyText = data.content || 'I encountered an issue processing your question. Please try again!';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: aiReplyText
      };

      setMessages((prev) => [...prev, aiMessage]);
      speakText(aiReplyText);

    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'AI',
        content: '⚠️ Unable to connect to AI server. Please check your connection or API keys!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          KAIRO Mentor Studio
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceOutput(!voiceOutput)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              voiceOutput ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
            title="Toggle Voice Output Speech Synthesis"
          >
            {voiceOutput ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{voiceOutput ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <select
            value={depth}
            onChange={(e: any) => setDepth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="beginner">🌱 Beginner (ELIF5)</option>
            <option value="intermediate">⚡ Intermediate (Code)</option>
            <option value="advanced">🔬 Deep Dive (Math & Arch)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'USER'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-200/80'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white text-slate-500 px-5 py-3.5 rounded-2xl text-sm rounded-bl-none shadow-sm border border-slate-200/80 flex items-center gap-2">
                <Sparkles size={16} className="animate-spin text-blue-600" />
                <span>KAIRO AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <button type="button" className="absolute left-4 text-slate-400 hover:text-blue-600 transition-colors">
            <Paperclip size={18} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask KAIRO anything (e.g., 'Explain Recursion' or 'Debug my function')..."
            className="w-full pl-12 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
          
          <div className="absolute right-3 flex items-center gap-2">
            <button type="button" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Mic size={18} />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
