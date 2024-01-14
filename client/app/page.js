'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading');
  const [people, setPeople] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/home');
        const data = await response.json();
        setMessage(data.message);
        setPeople(data.people);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <p className="mb-4">{message}</p>
      {people.map((name, index) => (
        <p key={index}>{name}</p>
      ))}
    </main>
  );
}
