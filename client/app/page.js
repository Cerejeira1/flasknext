'use client';
import CentralImage from '@/components/central-image';
import Sidebar from '@/components/sidebar';
import Suggestions from '@/components/suggestions';
import { useState, useEffect, useRef } from 'react';
import {
  FaPaperPlane,
  FaSpinner,
  FaUser,
  FaRobot,
  FaArrowDown,
  FaUserAstronaut,
} from 'react-icons/fa';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState('Todos');
  const [isAssistantWriting, setIsAssistantWriting] = useState(false);

  const endOfMessagesRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollDown(false);
  };

  const handleScroll = () => {
    const isAtBottom =
      chatContainerRef.current.scrollHeight -
        chatContainerRef.current.scrollTop <=
      chatContainerRef.current.clientHeight + 10;
    setShowScrollDown(!isAtBottom);
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (input = userInput) => {
    setUserInput('');
    if (input === '') return;

    abortControllerRef.current = new AbortController();

    // Initialize conversation with a system message if this is the first user input
    const initialSystemMessage =
      conversation.length === 0
        ? [{ role: 'system', content: 'Initial context or instructions' }]
        : [];

    const newUserMessage = { role: 'user', content: input };
    const updatedConversation = [
      ...initialSystemMessage,
      ...conversation,
      newUserMessage,
    ];
    setConversation(updatedConversation);
    setMessages([...messages, newUserMessage]);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          convo: updatedConversation,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      let partialResponse = '';
      let isFirstChunk = true;
      setIsAssistantWriting(true); // Assistant starts writing

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('Stream complete');
          setIsAssistantWriting(false); // Assistant finishes writing
          break;
        }

        partialResponse += new TextDecoder('utf-8').decode(value, {
          stream: true,
        });

        // Update the conversation
        if (isFirstChunk) {
          setConversation((prevConvo) => [
            ...prevConvo,
            { role: 'assistant', content: partialResponse },
          ]);
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: partialResponse },
          ]);
          isFirstChunk = false;
        } else {
          setConversation((prevConvo) => [
            ...prevConvo.slice(0, -1),
            { ...prevConvo[prevConvo.length - 1], content: partialResponse },
          ]);
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            {
              ...prevMessages[prevMessages.length - 1],
              content: partialResponse,
            },
          ]);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error:', error);
        const errorAssistantMessage = {
          role: 'assistant',
          content: 'Houve um erro, tente novamente mais tarde',
        };
        setMessages((prevMessages) => [...prevMessages, errorAssistantMessage]);
        setIsAssistantWriting(false); // Ensure it's set to false in case of error
      }
    }

    setLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion);
    handleSendMessage(suggestion);
  };

  return (
    <>
      <div className="flex h-[100dvh] bg-slate-100">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          selectedParty={selectedParty}
          setSelectedParty={setSelectedParty}
          setConversation={setConversation}
          setMessages={setMessages}
          abortController={abortControllerRef.current}
          setLoading={setLoading}
        />
        <div className="flex flex-col justify-between h-screen p-6 bg-slate-100 w-full relative">
          {showScrollDown && !isAssistantWriting && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-32 mx-auto p-2 bg-black rounded-lg text-white hover:bg-black/80 cursor-pointer"
              onClick={scrollToBottom}
            >
              <FaArrowDown size={12} />
            </button>
          )}
          <div
            className="overflow-auto space-y-2 mb-2 hide-scrollbar"
            ref={chatContainerRef}
          >
            {messages.map((msg, index) => (
              <div key={index} className="flex flex-col max-w-2xl mx-auto ">
                <div className="flex items-center">
                  {msg.role === 'user' ? (
                    <FaUser className="mr-2 text-black" />
                  ) : (
                    <FaUserAstronaut className="mr-2 text-black" />
                  )}
                  <p className="text-sm text-black font-semibold">
                    {msg.role === 'user' ? 'Você' : 'Horácio'}
                  </p>
                </div>
                <p
                  className={`rounded-lg px-4 py-2 mt-1 text-sm border mb-4 ${
                    msg.role === 'user'
                      ? 'text-gray-700 border-slate-200'
                      : 'text-gray-700 border-slate-200'
                  } whitespace-pre-wrap `}
                >
                  {msg.content}
                </p>
              </div>
            ))}

            <div ref={endOfMessagesRef}></div>
          </div>

          <div className="w-full max-w-2xl mx-auto mt-auto flex flex-col space-y-4">
            {messages.length === 0 && (
              <>
                <CentralImage selectedParty={selectedParty} />
                <Suggestions
                  selectedParty={selectedParty}
                  onSuggestionClick={handleSuggestionClick}
                />
              </>
            )}

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 relative ">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 p-3 pl-4 pr-14 shadow-lg text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-black"
                  placeholder="Escreva uma pergunta ao Horácio..."
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="absolute right-[6px] p-3 bg-black rounded-lg text-white hover:bg-black/80 disabled:bg-slate-300"
                  disabled={loading || userInput == ''}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={12} />
                  ) : (
                    <FaPaperPlane size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs text-black mx-auto opacity-20 px-4 text-center">
                O chatbot pode cometer erros, considere verificar as informações
                importantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
