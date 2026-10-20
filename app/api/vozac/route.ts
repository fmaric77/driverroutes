// app/api/vozac/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

interface PutovanjeRow extends RowDataPacket {
  id: number;
  datum: Date;
  vozac_ime: string;
  vozac_prezime: string;
  registracija: string;
  status: string;
  ruta: string;
  rampa: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vozacId = searchParams.get('vozac_id');

  if (!vozacId) {
    return NextResponse.json({ error: 'vozac_id is required' }, { status: 400 });
  }

  const connection = await getConnection();

  try {
    const [rows] = await connection.execute<PutovanjeRow[]>(
      `SELECT 
        p.id, 
        p.datum, 
        v.ime_vozaca AS vozac_ime, 
        v.prezime_vozaca AS vozac_prezime, 
        k.registracija, 
        k.status,       
        sr.ruta,
        (
          SELECT ks.rampa
          FROM KamioniNaSkladistu ks
          WHERE ks.kamion_id = k.id
          LIMIT 1
        ) AS rampa
      FROM 
        Putovanja p
      JOIN 
        Vozaci v ON p.vozac_id = v.id
      JOIN 
        Kamioni k ON p.kamion_id = k.id
      JOIN 
        SpremneRute sr ON p.ruta_id = sr.id
      WHERE 
        p.vozac_id = ? AND
        p.datum >= CURDATE()
      ORDER BY 
        p.datum ASC, p.id ASC`,
      [vozacId]
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      datum: row.datum.toISOString().slice(0, 10)
    }));

    return NextResponse.json(formattedRows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Greška pri dohvaćanju putovanja:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch putovanja' }, { status: 500 });
  } finally {
    await connection.end();
  }
}