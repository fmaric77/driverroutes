// lib/db.ts

import mysql from 'mysql2/promise';

// Database connection configuration
const config = {
  host: 'ucka.veleri.hr', // Change if necessary
  user: 'fmaric',
  password: '11',
  database: 'fmaric',
  port: 3306,
};

export const getConnection = async () => {
  const connection = await mysql.createConnection(config);
  return connection;
};
