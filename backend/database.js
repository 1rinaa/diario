// database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export async function initializeDatabase() {
  db = await open({
    filename: join(__dirname, 'reencuentro.db'),
    driver: sqlite3.Database
  });

  // Crear tablas
  await db.exec(`
    -- Usuarios (solo habrá 1 para ti)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Diario emocional
    CREATE TABLE IF NOT EXISTS emotional_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      primary_emotion TEXT NOT NULL,
      intensity INTEGER CHECK(intensity BETWEEN 1 AND 5),
      triggers TEXT,
      body_text TEXT,
      physical_symptoms TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );

    -- Diario del día
    CREATE TABLE IF NOT EXISTS daily_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      morning_reflection TEXT,
      achievements TEXT,
      struggles TEXT,
      gratitude TEXT,
      evening_reflection TEXT,
      sleep_hours REAL,
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );
    
     -- Tabla de PDFs
    CREATE TABLE IF NOT EXISTS pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_opened DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Tabla de anotaciones del PDF espejo
    CREATE TABLE IF NOT EXISTS pdf_annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pdf_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      x REAL,
      y REAL,
      original_text TEXT,
      reflection_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
    );
  `);
  
  console.log('✅ Base de datos SQLite inicializada');
  return db;
}

export function getDb() {
  return db;
}