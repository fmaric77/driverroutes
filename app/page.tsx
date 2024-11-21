// app/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [oib, setOib] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oib || !password) {
      setError('OIB i lozinka su obavezni');
      return;
    }

    try {
      console.log('Sl zahtjeva za prijavu:', { oib, password });

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oib, password }),
      });

      const data = await res.json();

      console.log('Primljen odgovor:', data);

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Pohrani informacije o vozaču u lokalnu pohranu
      localStorage.setItem('vozac', JSON.stringify(data.vozac));

      // Log the login action
      await logAction('Vozač se prijavio', data.vozac.id);

      // Preusmjeri na vozačku ploču
      router.push('/vozac'); // Prilagodite putanju do vaše vozačke ploče
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      setError((error as Error).message);
    }
  };

  const logAction = async (action: string, vozacId: number) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, vozacId }),
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Prijava vozača</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="oib" className="block text-sm font-medium text-gray-300">OIB</label>
            <input
              type="text"
              id="oib"
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={oib}
              onChange={(e) => setOib(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Lozinka</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Prijava
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;