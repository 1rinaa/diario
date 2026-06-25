// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, getDb } from './database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-temporal';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicializar base de datos
await initializeDatabase();

// ========== CONFIGURACIÓN DE MULTER PARA PDFs ==========
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ========== RUTAS PÚBLICAS ==========

app.get('/', (req, res) => {
  res.json({ message: '🌸 Servidor Reencuentro funcionando', database: 'conectada' });
});

app.post('/api/setup', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario. Usa /api/login' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== MIDDLEWARE DE AUTENTICACIÓN ==========
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
}

// ========== RUTAS DEL DIARIO EMOCIONAL ==========
app.post('/api/emotional', verificarToken, async (req, res) => {
  const { date, primary_emotion, intensity, triggers, body_text, physical_symptoms } = req.body;
  const db = getDb();
  
  try {
    await db.run(
      `INSERT INTO emotional_entries (user_id, date, primary_emotion, intensity, triggers, body_text, physical_symptoms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, date, primary_emotion, intensity, triggers || '', body_text || '', physical_symptoms || '']
    );
    res.json({ message: 'Emoción guardada 💚' });
  } catch (error) {
    console.error('Error al guardar emoción:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/emotional', verificarToken, async (req, res) => {
  const db = getDb();
  
  try {
    const entries = await db.all(
      'SELECT * FROM emotional_entries WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );
    res.json(entries);
  } catch (error) {
    console.error('Error al obtener emociones:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DEL DIARIO DEL DÍA ==========
app.post('/api/daily', verificarToken, async (req, res) => {
  const { date, morning_reflection, achievements, struggles, gratitude, evening_reflection, sleep_hours, energy_level } = req.body;
  const db = getDb();
  
  try {
    await db.run(
      `INSERT OR REPLACE INTO daily_journal 
       (user_id, date, morning_reflection, achievements, struggles, gratitude, evening_reflection, sleep_hours, energy_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, date, morning_reflection || '', achievements || '', struggles || '', gratitude || '', evening_reflection || '', sleep_hours || 7, energy_level || 3]
    );
    res.json({ message: 'Diario guardado 💚' });
  } catch (error) {
    console.error('Error al guardar diario:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/daily', verificarToken, async (req, res) => {
  const db = getDb();
  
  try {
    const entries = await db.all(
      'SELECT * FROM daily_journal WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );
    res.json(entries);
  } catch (error) {
    console.error('Error al obtener diario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE PDFs ==========

// IMPORTANTE: Esta ruta debe ir ANTES que las que tienen :id
// Obtener TODOS los PDFs del usuario
app.get('/api/pdfs', verificarToken, async (req, res) => {
  const db = getDb();
  
  try {
    console.log('📚 Obteniendo PDFs para usuario:', req.userId);
    const pdfs = await db.all(
      'SELECT * FROM pdfs WHERE user_id = ? ORDER BY upload_date DESC',
      [req.userId]
    );
    console.log(`✅ Encontrados ${pdfs.length} PDFs`);
    res.json(pdfs);
  } catch (error) {
    console.error('Error al obtener PDFs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subir PDF
app.post('/api/pdfs/upload', verificarToken, upload.single('pdf'), async (req, res) => {
  const db = getDb();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    const result = await db.run(
      `INSERT INTO pdfs (user_id, filename, original_name, file_path)
       VALUES (?, ?, ?, ?)`,
      [req.userId, req.file.filename, req.file.originalname, req.file.filename] // Guardar solo el nombre
    );
    
    res.json({ 
      message: 'PDF subido exitosamente',
      pdf: {
        id: result.lastID,
        filename: req.file.filename,
        original_name: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Error al subir PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta pública para ver PDFs (sin autenticación)
app.get('/api/pdfs/view/:id', async (req, res) => {
  const db = getDb();
  
  try {
    console.log('🔍 Buscando PDF público ID:', req.params.id);
    
    const pdf = await db.get('SELECT * FROM pdfs WHERE id = ?', [req.params.id]);
    
    if (!pdf) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }
    
    // El filename ya es solo el nombre del archivo
    const fullPath = path.join(__dirname, 'uploads', pdf.filename);
    
    console.log('📁 Ruta del archivo:', fullPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log('❌ Archivo no existe');
      return res.status(404).json({ error: 'Archivo PDF no encontrado' });
    }
    
    console.log('✅ Enviando PDF');
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Error al obtener PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener anotaciones de un PDF
app.get('/api/pdfs/:pdfId/annotations', verificarToken, async (req, res) => {
  const { pdfId } = req.params;
  const db = getDb();
  
  try {
    const annotations = await db.all(
      'SELECT * FROM pdf_annotations WHERE pdf_id = ? ORDER BY created_at DESC',
      [pdfId]
    );
    res.json(annotations);
  } catch (error) {
    console.error('Error al obtener anotaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Guardar anotación
app.post('/api/pdfs/:pdfId/annotations', verificarToken, async (req, res) => {
  const { pdfId } = req.params;
  const { page_number, original_text, reflection_text } = req.body;
  const db = getDb();
  
  try {
    const pdf = await db.get(
      'SELECT * FROM pdfs WHERE id = ? AND user_id = ?',
      [pdfId, req.userId]
    );
    
    if (!pdf) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }
    
    const result = await db.run(
      `INSERT INTO pdf_annotations (pdf_id, page_number, original_text, reflection_text)
       VALUES (?, ?, ?, ?)`,
      [pdfId, page_number || 1, original_text || '', reflection_text || '']
    );
    
    res.json({ 
      message: 'Anotación guardada',
      annotation: { id: result.lastID }
    });
  } catch (error) {
    console.error('Error al guardar anotación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar PDF
app.delete('/api/pdfs/:id', verificarToken, async (req, res) => {
  const db = getDb();
  
  try {
    const pdf = await db.get(
      'SELECT * FROM pdfs WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (!pdf) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }
    
    const fullPath = path.join(__dirname, 'uploads', pdf.filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    await db.run('DELETE FROM pdf_annotations WHERE pdf_id = ?', [req.params.id]);
    await db.run('DELETE FROM pdfs WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'PDF eliminado' });
  } catch (error) {
    console.error('Error al eliminar PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`🌸 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Uploads: ${uploadDir}`);
});