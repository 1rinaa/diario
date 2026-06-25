// database.js
import pg from 'pg';
const { Pool } = pg;

let pool;

export async function initializeDatabase() {
  // Render te dará una variable llamada DATABASE_URL. 
  // En local usará tu string de conexión normal.
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Crear tablas con sintaxis nativa de Postgres
  await pool.query(`
    -- Usuarios
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Diario emocional
    CREATE TABLE IF NOT EXISTS emotional_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date DATE NOT NULL,
      primary_emotion TEXT NOT NULL,
      intensity INTEGER CHECK(intensity BETWEEN 1 AND 5),
      triggers TEXT,
      body_text TEXT,
      physical_symptoms TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );

    -- Diario del día
    CREATE TABLE IF NOT EXISTS daily_journal (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date DATE NOT NULL,
      morning_reflection TEXT,
      achievements TEXT,
      struggles TEXT,
      gratitude TEXT,
      evening_reflection TEXT,
      sleep_hours REAL,
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
    
    -- Tabla de PDFs
    CREATE TABLE IF NOT EXISTS pdfs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_opened TIMESTAMP
    );

    -- Tabla de anotaciones del PDF espejo
    CREATE TABLE IF NOT EXISTS pdf_annotations (
      id SERIAL PRIMARY KEY,
      pdf_id INTEGER NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
      page_number INTEGER NOT NULL,
      x REAL,
      y REAL,
      original_text TEXT,
      reflection_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ Base de datos PostgreSQL inicializada con éxito');
}

// Creamos un objeto "espejo" para que server.js mantenga los mismos métodos .get, .all y .run 
// ¡Así no tienes que cambiar nada de tus endpoints!
export function getDb() {
  return {
    // Para SELECT * de una sola fila
    get: async (text, params) => {
      const res = await pool.query(text.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return res.rows[0];
    },
    // Para SELECT * de múltiples filas
    all: async (text, params) => {
      const res = await pool.query(text.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return res.rows;
    },
    // Para INSERTs, UPDATEs o DELETEs
    run: async (text, params) => {
      // Postgres usa $1, $2 en vez de ? para los parámetros seguro
      const formattedText = text.replace(/\?/g, (_, i) => `$${i + 1}`);
      const res = await pool.query(formattedText, params);
      return { lastID: res.insertedId || null };
    }
  };
}