// app/api/vozac/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interfaces
interface PutovanjeRow extends RowDataPacket {
  id: number;
  datum: Date;
  vozac_ime: string;
  vozac_prezime: string;
  registracija: string;
  ruta: string;
}

interface PutovanjeInput {
  id?: number;
  datum: string;
  vozac_id: number;
  kamion_id: number;
  ruta_id: number;
}

interface PutovanjeOutput extends PutovanjeInput {
  id: number;
}

// GET endpoint
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
        sr.ruta 
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
        p.datum ASC`,
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

// POST endpoint
export async function POST(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const input: PutovanjeInput = await request.json();
    const { datum, vozac_id, kamion_id, ruta_id } = input;

    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Putovanja (datum, vozac_id, kamion_id, ruta_id) VALUES (?, ?, ?, ?)',
      [datum, vozac_id, kamion_id, ruta_id]
    );

    const output: PutovanjeOutput = {
      id: result.insertId,
      datum,
      vozac_id,
      kamion_id,
      ruta_id
    };

    return NextResponse.json(output, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to add putovanje:', errorMessage);
    return NextResponse.json({ error: 'Failed to add putovanje' }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// PUT endpoint
export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const input: PutovanjeOutput = await request.json();
    const { id, datum, vozac_id, kamion_id, ruta_id } = input;

    await connection.execute(
      'UPDATE Putovanja SET datum = ?, vozac_id = ?, kamion_id = ?, ruta_id = ? WHERE id = ?',
      [datum, vozac_id, kamion_id, ruta_id, id]
    );

    return NextResponse.json(input);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to update putovanje:', errorMessage);
    return NextResponse.json({ error: 'Failed to update putovanje' }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// DELETE endpoint
export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const { id } = await request.json();

    await connection.execute(
      'DELETE FROM Putovanja WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Putovanje deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete putovanje:', errorMessage);
    return NextResponse.json({ error: 'Failed to delete putovanje' }, { status: 500 });
  } finally {
    await connection.end();
  }
}