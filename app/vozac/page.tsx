// app/vozac/page.tsx

"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Putovanje {
  id: number;
  datum: string; 
  vozac_ime: string;
  vozac_prezime: string;
  registracija: string;
  ruta: string;
  status: string;
  rampa: string | null;
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.slice(0, 10).split('-');
  if (!year || !month || !day) return dateString;
  return `${day}.${month}.${year}`;
};

const VozacDashboard = () => {
  const [putovanja, setPutovanja] = useState<Putovanje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vozacIme, setVozacIme] = useState('');
  const router = useRouter();
  const previousPutovanjaRef = useRef<Putovanje[]>([]);


  // Zahtjev za dozvolu za prikazivanje obavijesti
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchPutovanja = async () => {
      const storedVozac = localStorage.getItem('vozac');
      if (!storedVozac) {
        router.push('/');
        return;
      }

      const vozac = JSON.parse(storedVozac);
      setVozacIme([vozac.ime, vozac.prezime].filter(Boolean).join(' '));
      if (!vozac.id) {
        setError('Neispravan podatak o vozaču.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/vozac?vozac_id=${vozac.id}`);
        const data: Putovanje[] = await res.json();

        if (!res.ok) {
          throw new Error('Failed to fetch putovanja');
        }

        const todayDate = new Date();
        const todayString = `${todayDate.getFullYear()}-${String(
          todayDate.getMonth() + 1
        ).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

        const filteredPutovanja = data.filter((putovanje: Putovanje) => {
          return putovanje.datum >= todayString;
        });

        const previousPutovanja = previousPutovanjaRef.current;
        const updatedPutovanja = filteredPutovanja.filter((putovanje) => {
          const prev = previousPutovanja.find(p => p.id === putovanje.id);
          return prev && prev.status !== putovanje.status;
        });

        if (updatedPutovanja.length > 0 && Notification.permission === 'granted') {
          updatedPutovanja.forEach((putovanje) => {
            new Notification('Putovanje ažurirano', {
              body: `Datum: ${formatDate(putovanje.datum)}\nRuta: ${putovanje.ruta}\nStatus: ${putovanje.status}`,
            });
          });
        }

        previousPutovanjaRef.current = filteredPutovanja;
        setPutovanja(filteredPutovanja);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message || 'Greška pri učitavanju putovanja.');
        } else {
          setError('Greška pri učitavanju putovanja.');
        }
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchPutovanja, 60000);
    fetchPutovanja();

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vozac');
    router.push('/');
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ui-kicker">Vozač</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Vaša putovanja</h1>
            <p className="mt-1 text-sm text-slate-400">{vozacIme || 'Nadolazeće rute'}</p>
          </div>
          <button type="button" onClick={handleLogout} className="ui-btn ui-btn-danger">
            Odjavi se
          </button>
        </header>

        {loading && <p className="text-slate-300">Učitavanje...</p>}
        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}
        {!loading && !error && putovanja.length === 0 && (
          <p className="ui-card px-5 py-8 text-slate-300">Nemate nadolazećih putovanja.</p>
        )}
        {!loading && !error && putovanja.length > 0 && (
          <ul className="space-y-3">
            {putovanja.map((putovanje, index) => (
              <li key={putovanje.id} className="ui-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{formatDate(putovanje.datum)}</p>
                    <h2 className="mt-1 text-lg font-semibold">{putovanje.ruta}</h2>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-400">Kamion</dt>
                    <dd className="mt-0.5 font-mono tracking-wider">{putovanje.registracija}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Vozač</dt>
                    <dd className="mt-0.5">{putovanje.vozac_ime} {putovanje.vozac_prezime}</dd>
                  </div>
                  {index === 0 && (
                    <div>
                      <dt className="text-slate-400">Status</dt>
                      <dd className="mt-0.5">{putovanje.status}</dd>
                    </div>
                  )}
                  {index === 0 && (
                    <div>
                      <dt className="text-slate-400">Rampa</dt>
                      <dd className="mt-0.5">{putovanje.rampa || 'Nije dodijeljena'}</dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VozacDashboard;