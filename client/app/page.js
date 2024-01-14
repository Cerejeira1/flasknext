'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading');
  const fetchData = async () => {
    try {
      const options = {
        cache: 'no-store',
        method: 'GET',
        next: { revalidate: 0 },
      };
      const response = await fetch('http://localhost:8080/api/home', options);
      const data = await response.json();
      setMessage(data.message);
      console.log('data catched');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <p className="mb-4">{message}</p>
      {/*people.map((name, index) => (
        <p key={index}>{name}</p>
      ))*/}
    </main>
  );
}
