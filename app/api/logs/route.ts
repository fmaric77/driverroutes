import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

interface VozacRow extends RowDataPacket {
  ime_vozaca: string;
  prezime_vozaca: string;
  oib_vozaca: string;
}

export async function POST(req: Request) {
  const { action, vozacId } = await req.json();

  if (!action || !vozacId) {
    return NextResponse.json({ message: 'action and vozacId are required' }, { status: 400 });
  }

  const connection = await getConnection();

  try {
    const [rows] = await connection.execute<VozacRow[]>(
      'SELECT ime_vozaca, prezime_vozaca, oib_vozaca FROM Vozaci WHERE id = ?',
      [vozacId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Vozač nije pronađen' }, { status: 404 });
    }

    const vozac = rows[0];
    const text = `${action}: ${vozac.ime_vozaca} ${vozac.prezime_vozaca} (OIB ${vozac.oib_vozaca})`.slice(0, 255);
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await connection.execute(
      'INSERT INTO Logs (admin_id, action, timestamp) VALUES (NULL, ?, ?)',
      [text, timestamp]
    );

    return NextResponse.json({ message: 'Log created successfully' });
  } catch (error) {
    console.error('Error logging action:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await connection.end();
  }
}
