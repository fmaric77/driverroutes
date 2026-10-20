// app/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Types and interfaces
interface Vozac {
  id: number;
  oib: string;
  ime?: string;
  prezime?: string;
}

interface LoginResponse {
  vozac: Vozac;
  message?: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const LoginPage = () => {
  const [oib, setOib] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logAction = async (action: string, vozacId: number): Promise<void> => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, vozacId }),
      });

      if (!response.ok) {
        throw new Error('Failed to log action');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error logging action:', errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!oib || !password) {
      setError('OIB i lozinka su obavezni');
      return;
    }

    try {
      console.log('Šaljem zahtjev za prijavu:', { oib });

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oib, password }),
      });

      const data = await res.json() as LoginResponse | ApiError;

      console.log('Primljen odgovor:', data);

      if (!res.ok) {
        throw new Error('message' in data ? data.message : 'Greška pri prijavi');
      }

      if ('vozac' in data) {
        localStorage.setItem('vozac', JSON.stringify(data.vozac));
        await logAction('Vozač se prijavio', data.vozac.id);
        router.push('/vozac');
      }
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      setError(error instanceof Error ? error.message : 'Nepoznata greška');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ui-card w-full max-w-md p-8">
        <p className="ui-kicker">Vozač</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Prijava vozača</h1>
        <p className="mt-2 text-sm text-slate-400">Prijavite se OIB-om da vidite nadolazeća putovanja.</p>
        {error && (
          <p className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="oib" className="ui-label">OIB</label>
            <input
              type="text"
              id="oib"
              inputMode="numeric"
              autoComplete="username"
              className="ui-input"
              value={oib}
              onChange={(e) => setOib(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="ui-label">Lozinka</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="ui-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="ui-btn ui-btn-primary mt-2 w-full">
            Prijava
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;