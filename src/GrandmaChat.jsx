import React, { useState, useRef, useEffect } from 'react';

export default function GrandmaChat({ isTranscriptOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const getGreeting = (english) =>
    english
      ? "Hello my dear. Grandma is here. What would you like to ask me about my life?"
      : "Chào cháu. Bà đây. Cháu muốn hỏi bà điều gì về cuộc đời của bà không?";

  const [messages, setMessages] = useState([
    {
      sender: 'grandma',
      text: getGreeting(false),
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1) {
        return [
          {
            sender: 'grandma',
            text: getGreeting(isEnglish),
          },
        ];
      }
      return prev;
    });
  }, [isEnglish]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMessage,
      },
    ]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          language: isEnglish ? 'English' : 'Vietnamese',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'grandma',
            text: data.reply,
          },
        ]);
      } else {
        const errorDetails =
          data.error?.message ||
          data.error ||
          'Unknown error occurred';

        setMessages((prev) => [
          ...prev,
          {
            sender: 'grandma',
            text: isEnglish
              ? `Sorry dear, Grandma ran into a problem: ${errorDetails}`
              : `Bà gặp chút trục trặc rồi cháu ạ: ${errorDetails}`,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'grandma',
          text: isEnglish
            ? "The connection seems weak, my dear. Grandma couldn't hear you clearly."
            : 'Hình như sóng yếu quá cháu ạ, bà chưa nghe rõ cháu nói gì.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionClasses = () => {
    if (isTranscriptOpen) {
      return 'bottom-6 left-6 md:left-auto md:right-[504px] lg:right-[564px]';
    }

    if (isOpen) {
      return 'bottom-6 right-6';
    }

    return 'bottom-24 right-6';
  };

  return (
    <div
      className={`fixed z-50 font-sans transition-all duration-300 ease-in-out ${getPositionClasses()}`}
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold font-mono text-xs tracking-wider uppercase rounded-full shadow-2xl flex items-center space-x-2 border border-amber-500/20 transition-all duration-300 hover:scale-105"
        >
          <span>💬 Chat with Grandma (She is billingual btw)</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-[#121513] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">

          <div className="p-4 bg-[#0c0e0c] border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-serif text-sm font-bold text-neutral-100 tracking-wide">
                  Ký Ức Của Bà
                </h3>
                <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  Interactive Oral History AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-colors focus:outline-none"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-black font-medium rounded-tr-none'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-850 rounded-tl-none font-light'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 text-neutral-500 border border-neutral-850 rounded-2xl rounded-tl-none p-3 text-xs font-mono tracking-widest flex items-center space-x-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:0.4s]">
                    .
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-[#0c0e0c] border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isEnglish
                  ? 'Ask Grandma a story...'
                  : 'Cháu muốn hỏi bà chuyện gì...'
              }
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
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                />
              </svg>
            </button>
          </form>

        </div>
      )}
    </div>
  );
}