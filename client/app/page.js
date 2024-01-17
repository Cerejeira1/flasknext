'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FaPaperPlane,
  FaSpinner,
  FaUser,
  FaRobot,
  FaArrowDown,
} from 'react-icons/fa';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const endOfMessagesRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollDown(false);
  };

  const handleScroll = () => {
    const isAtBottom =
      chatContainerRef.current.scrollHeight -
        chatContainerRef.current.scrollTop <=
      chatContainerRef.current.clientHeight + 10; // Small threshold to improve UX
    setShowScrollDown(!isAtBottom);
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    const newUserMessage = { role: 'user', message: userInput };
    setMessages([...messages, newUserMessage]);

    setLoading(true);
    const response = await fetch(
      `http://localhost:8080/api/home?question=${encodeURIComponent(userInput)}`
    );
    const data = await response.json();
    const newAssistantMessage = { role: 'assistant', message: data.message };

    setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
    setUserInput('');
    setLoading(false);
  };

  return (
    <main className="flex flex-col justify-between h-screen p-6 bg-gray-100">
      <div
        className="overflow-auto space-y-2 mb-4 hide-scrollbar"
        style={{ maxHeight: '100vh' }}
        ref={chatContainerRef}
      >
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col max-w-2xl mx-auto ">
            <div className="flex items-center">
              {msg.role === 'user' ? (
                <FaUser className="mr-2 text-blue-500" />
              ) : (
                <FaRobot className="mr-2 text-green-500" />
              )}
              <p className="text-sm font-semibold">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </p>
            </div>
            <p
              className={`rounded-lg px-4 py-2 mt-1 text-sm border mb-4 ${
                msg.role === 'user'
                  ? 'text-gray-700 border-gray-200'
                  : 'text-gray-700 border-gray-200'
              }`}
            >
              {msg.message}
            </p>
          </div>
        ))}
        <div ref={endOfMessagesRef}></div>
      </div>
      {showScrollDown && (
        <button
          className="fixed bottom-[85px] left-1/2 transform -translate-x-1/2 p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
          onClick={scrollToBottom}
        >
          <FaArrowDown size={12} />
        </button>
      )}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 pl-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-[6px] p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin" size={12} />
            ) : (
              <FaPaperPlane size={12} />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
