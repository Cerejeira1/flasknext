'use client';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');
  const [userQuestion, setUserQuestion] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/home?question=${encodeURIComponent(
          userQuestion
        )}`
      );
      const data = await response.json();
      setMessage(data.message);
      setUserQuestion('');
      console.log('Data fetched');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="mb-4 w-full max-w-xl p-4 bg-white rounded shadow-md">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Enter your question"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <button
          onClick={fetchData}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          Submit Question
        </button>
      </div>
      <div className="mt-4 w-full max-w-xl p-4 bg-white rounded shadow-md">
        <p className="text-gray-700">{message}</p>
      </div>
    </main>
  );
}
