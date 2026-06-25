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


// database.js
export function getDb() {
  return {
    // Para SELECT * de una sola fila
    get: async (text, params) => {
      const safeParams = params || [];
      
      // Convierte dinámicamente cada '?' en '$1', '$2', '$3' progresivamente de forma correcta
      let index = 1;
      const formattedText = text.replace(/\?/g, () => `$${index++}`);
      
      const res = await pool.query(formattedText, safeParams);
      
      // Parche para COUNT: Asegura que devuelva un número idéntico a SQLite
      if (res.rows[0] && res.rows[0].count !== undefined) {
        res.rows[0].count = Number(res.rows[0].count);
      }
      
      return res.rows[0];
    },
    
    // Para SELECT * de múltiples filas
    all: async (text, params) => {
      const safeParams = params || [];
      let index = 1;
      const formattedText = text.replace(/\?/g, () => `$${index++}`);
      
      const res = await pool.query(formattedText, safeParams);
      return res.rows;
    },
    
    // Para INSERTs, UPDATEs o DELETEs
    run: async (text, params) => {
      const safeParams = params || [];
      let index = 1;
      let formattedText = text.replace(/\?/g, () => `$${index++}`);
      
      // Si es un INSERT, le pedimos que nos devuelva el ID creado para simular lastID de SQLite
      if (formattedText.trim().toLowerCase().startsWith('insert')) {
        // Solo lo agrega si no tiene ya un RETURNING o un ON CONFLICT complejo al final
        if (!formattedText.toLowerCase().includes('returning') && !formattedText.toLowerCase().includes('on conflict')) {
          formattedText += ' RETURNING id';
        } else if (formattedText.toLowerCase().includes('on conflict')) {
          formattedText += ' RETURNING id';
        }
      }
      
      const res = await pool.query(formattedText, safeParams);
      return { lastID: res.rows[0]?.id || null };
    }
  };
}