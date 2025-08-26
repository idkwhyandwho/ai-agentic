'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';

// This will be our new, styled ChatBox component
const ChatBox = ({ input, handleInputChange, handleSubmit }: any) => (
  <form onSubmit={handleSubmit} className="p-4 bg-gray-100 dark:bg-gray-800">
    <input
      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
      value={input}
      placeholder="Say something..."
      onChange={handleInputChange}
    />
  </form>
);

// This will be our new, styled ChatMessage component
const ChatMessage = ({ message }: { message: { id: string; role: 'user' | 'assistant'; content: string } }) => {
  const isUser = message.role === 'user';
  return (
    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`px-4 py-2 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
        {message.content}
      </div>
    </div>
  );
};

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const { messages, input, handleInputChange, handleSubmit, data } = useChat({
    body: { data: { sessionId } },
  });

  useEffect(() => {
    if (data && typeof data === 'object' && 'sessionId' in data && typeof data.sessionId === 'string') {
      if (data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
      }
    }
  }, [data, sessionId]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel Placeholder */}
      <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 hidden md:block">
        <h2 className="font-bold text-lg">Sessions</h2>
        {/* Session list will go here */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Placeholder */}
        <header className="p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold">{sessionId ? `Chat: ${sessionId.substring(0, 8)}...` : 'New Chat'}</h1>
        </header>

        {/* Message List */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m as any} />
          ))}
        </div>

        {/* ChatBox Input */}
        <ChatBox input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
      </div>

      {/* Right Panel Placeholder */}
      <div className="w-80 bg-gray-100 dark:bg-gray-800 p-4 hidden lg:block">
        <h2 className="font-bold text-lg">Tool Panel</h2>
        {/* Tool information will go here */}
      </div>
    </div>
  );
}
