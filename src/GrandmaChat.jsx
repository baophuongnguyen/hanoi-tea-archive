import React, { useState, useRef, useEffect } from 'react';

export default function GrandmaChat({ isTranscriptOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'grandma', text: 'Chào cháu, bà đây. Cháu muốn hỏi bà điều gì về những ngày ở quán trà đá phố Lý Thường Kiệt không?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

// Auto-scroll to the latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Synchronize Grandma's initial greeting with the language toggle state
  useEffect(() => {
    setMessages((prev) => {
      // Only swap the language if the user hasn't started the conversation yet
      if (prev.length === 1) {
        return [{
          sender: 'grandma',
          text: isEnglish 
            ? "Hello dear, Grandma's here. Do you want to ask me anything about the old days at the iced tea stall on Ly Thuong Kiet Street?"
            : "Chào cháu, bà đây. Cháu muốn hỏi bà điều gì về những ngày ở quán trà đá phố Lý Thường Kiệt không?"
        }];
      }
      return prev;
    });
  }, [isEnglish]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    // Strict enforcement rules to lock down the language weights
    const specializedPayload = isEnglish
      ? `CRITICAL SYSTEM RULE: You must translate all your thoughts and respond 100% ENTIRELY in English. Do not write a single word of Vietnamese. Maintain your warm, grandfather-caring Vietnamese grandmother persona, but express it entirely in fluent English. User text: ${userMessage}`
      : `CRITICAL SYSTEM RULE: Bạn đóng vai bà ngoại Hà Nội xưa. Hãy luôn luôn trả lời 100% hoàn toàn bằng tiếng Việt sử dụng giọng Bắc ấm áp, xởi lởi, gần gũi. Tin nhắn từ cháu: ${userMessage}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: specializedPayload }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { sender: 'grandma', text: data.reply }]);
      } else {
        const errorDetails = data.error?.message || data.error || JSON.stringify(data);
        setMessages((prev) => [...prev, { sender: 'grandma', text: `Hệ thống gặp lỗi: ${errorDetails}` }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [...prev, { sender: 'grandma', text: 'Hình như sóng yếu quá, bà chưa nghe rõ cháu nói gì. (Lỗi kết nối mạng)' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Positioning Engine to solve the overlap turf war
  const getPositionClasses = () => {
    if (isTranscriptOpen) {
      // State 1: Side Panel is open -> slide completely out of the way to the left side of the panel
      return 'bottom-6 left-6 md:left-auto md:right-[504px] lg:right-[564px]';
    }
    if (isOpen) {
      // State 2: Chat Box is open -> anchor beautifully to the bottom corner
      return 'bottom-6 right-6';
    }
    // State 3: Both closed -> Stack Grandma bubble neatly ABOVE the Transcript button
    return 'bottom-24 right-6';
  };

  return (
    <div className={`fixed z-50 font-sans transition-all duration-300 ease-in-out ${getPositionClasses()}`}>
      {/* Floating Toggle Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold font-mono text-xs tracking-wider uppercase rounded-full shadow-2xl flex items-center space-x-2 border border-amber-500/20 transition-all duration-300 hover:scale-105"
        >
          <span>💬 Chat with Grandma (She is billingual btw)</span>
        </button>
      )}

      {/* Chat Window Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-[#121513] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="p-4 bg-[#0c0e0c] border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-serif text-sm font-bold text-neutral-100 tracking-wide">Ký ức của Bà</h3>
                <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Interactive Oral History AI</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-colors focus:outline-none"
              title="Close Chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-black font-medium rounded-tr-none'
                    : 'bg-neutral-900 text-neutral-200 border border-neutral-850 rounded-tl-none font-light'
                }`}>
                  {msg.text.replace(/^\[System Directive:.*?\]\s*/, '')}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 text-neutral-500 border border-neutral-850 rounded-2xl rounded-tl-none p-3 text-xs font-mono tracking-widest flex items-center space-x-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">.</span>
                  <span className="animate-bounce [animation-delay:0.4s]">.</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Message Input Bar Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#0c0e0c] border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEnglish ? "Ask Grandma a story..." : "Cháu muốn hỏi bà chuyện gì..."}
              className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 placeholder:text-neutral-600 transition-colors"
              disabled={isLoading}
            />
            
            <button
              type="button"
              onClick={() => setIsEnglish(!isEnglish)}
              className={`px-2.5 py-2 rounded-xl font-mono text-[10px] font-bold border transition-all shrink-0 select-none ${
                isEnglish
                  ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                  : 'bg-neutral-900 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {isEnglish ? 'EN' : 'VN'}
            </button>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-neutral-900 border border-neutral-850 rounded-xl text-amber-500 hover:text-amber-400 hover:bg-neutral-850 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
              title="Send Message"
            >
              <svg className="w-4 h-4 animate-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>

        </div>
      )}
    </div>
  );
}