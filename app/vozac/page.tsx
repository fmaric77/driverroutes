// app/vozac/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Putovanje {
  id: number;
  datum: string; // ISO format 'yyyy-mm-dd'
  vozac_ime: string;
  vozac_prezime: string;
  registracija: string;
  ruta: string;
}

// Helper function to format date as dd.mm.yyyy
const formatDate = (dateString: string) => {
  // Create date and add one day
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  
  // Format with padding
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

const VozacDashboard = () => {
  const [putovanja, setPutovanja] = useState<Putovanje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPutovanja = async () => {
      const storedVozac = localStorage.getItem('vozac');
      if (!storedVozac) {
        router.push('/');
        return;
      }

      const vozac = JSON.parse(storedVozac);
      if (!vozac.id) {
        setError('Neispravan podatak o vozaču.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/vozac?vozac_id=${vozac.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch putovanja');
        }

        // Parse and filter trips based on current date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day

// Update the filtering section in the useEffect:
const filteredPutovanja = data.filter((putovanje: Putovanje) => {
  // Get today's date in YYYY-MM-DD format without timezone conversion
  const todayDate = new Date();
  const todayString = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  // Direct string comparison
  return putovanje.datum >= todayString;
});


        setPutovanja(filteredPutovanja);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message || 'Greška pri učitavanju putovanja.');
        } else {
          setError('Greška pri učitavanju putovanja.');
        }
      }finally {
        setLoading(false);
      }
    };

    fetchPutovanja();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vozac');
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500 bg-gray-900">{error}</div>;
  }

  if (putovanja.length === 0) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">No upcoming trips.</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Vaša Putovanja</h1>
        <ul className="space-y-4">
          {putovanja.map((putovanje) => (
            <li key={putovanje.id} className="p-4 border border-gray-600 rounded-lg shadow bg-gray-700 text-white">
              <p><strong>Datum:</strong> {formatDate(putovanje.datum)}</p>
              <p><strong>Vozač:</strong> {putovanje.vozac_ime} {putovanje.vozac_prezime}</p>
              <p><strong>Kamion:</strong> {putovanje.registracija}</p>
              <p><strong>Ruta:</strong> {putovanje.ruta}</p>
            </li>
          ))}
        </ul>
        <button 
          onClick={handleLogout} 
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Odjavi se
        </button>
      </div>
    </div>
  );
};

export default VozacDashboard;