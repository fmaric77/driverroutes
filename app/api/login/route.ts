// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db'; // Adjust the import path as necessary
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { oib, password } = await req.json();

  if (!oib || !password) {
    return NextResponse.json({ message: 'OIB i lozinka su obavezni' }, { status: 400 });
  }

  const connection = await getConnection();

  try {
    const [rows]: any = await connection.execute('SELECT * FROM Vozaci WHERE oib_vozaca = ?', [oib]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Neispravan OIB ili lozinka' }, { status: 401 });
    }

    const vozac = rows[0];

    const isPasswordValid = await bcrypt.compare(password, vozac.lozinka_vozaca);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Neispravan OIB ili lozinka' }, { status: 401 });
    }

    // Remove trips older than a week
    await connection.execute('DELETE FROM Putovanja WHERE datum < DATE_SUB(NOW(), INTERVAL 1 WEEK)');

    return NextResponse.json({ vozac });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    return NextResponse.json({ message: 'Greška pri prijavi' }, { status: 500 });
  } finally {
    connection.end();
  }
}