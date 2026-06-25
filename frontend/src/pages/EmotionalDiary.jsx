import React, { useState, useEffect } from 'react';
import { emotionalService } from '../services/api';
import { Save, Calendar, Heart, ArrowLeft, X, Plus, List, Smile, Meh, Frown, Zap, Flame, Star, Sun } from 'lucide-react';
import LayoutWithBg from '../components/LayoutWithBg';

function EmotionalDiary() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    primary_emotion: 'calma',
    intensity: 3,
    triggers: '',
    body_text: '',
    physical_symptoms: '',
  });
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await emotionalService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await emotionalService.create(formData);
      setMessage('✨ Emoción guardada con éxito ✨');
      setFormData({ ...formData, triggers: '', body_text: '', physical_symptoms: '' });
      loadEntries();
      setShowForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const emotions = [
    { value: 'alegria', icon: <Smile size={18} />, label: 'Alegría', color: '#fde68a', bg: '#fef9c3', borderColor: '#fde68a' },
    { value: 'calma', icon: <Sun size={18} />, label: 'Calma', color: '#a8d4b8', bg: '#e4f4ec', borderColor: '#a8d4b8' },
    { value: 'tristeza', icon: <Frown size={18} />, label: 'Tristeza', color: '#93c5fd', bg: '#e8f0fe', borderColor: '#93c5fd' },
    { value: 'ansiedad', icon: <Zap size={18} />, label: 'Ansiedad', color: '#c4b0e8', bg: '#ede8f8', borderColor: '#c4b0e8' },
    { value: 'ira', icon: <Flame size={18} />, label: 'Ira', color: '#e8a0d4', bg: '#fce4f3', borderColor: '#e8a0d4' },
    { value: 'neutral', icon: <Meh size={18} />, label: 'Neutral', color: '#d1d5db', bg: '#f3f4f6', borderColor: '#d1d5db' },
    { value: 'esperanza', icon: <Star size={18} />, label: 'Esperanza', color: '#fcd34d', bg: '#fef3c7', borderColor: '#fcd34d' },
  ];

  const getEmotionDetails = (emotion) => emotions.find(e => e.value === emotion) || emotions[0];

  const groupedEntries = entries.reduce((groups, entry) => {
    const month = entry.date.substring(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(entry);
    return groups;
  }, {});

  const months = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  const cardStyle = {
    background: 'linear-gradient(160deg, #fff9fe 0%, #f7f9ff 50%, #f4fbf7 100%)',
    border: '1px solid #e8d8f4',
    borderRadius: 20,
    padding: '1.5rem',
  };

  // Función para clonar el icono con el color específico
  const getColoredIcon = (icon, color, size = 20) => {
    return React.cloneElement(icon, { size, color, strokeWidth: 1.5 });
  };

  return (
    <LayoutWithBg>
      <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
        {message && (
          <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-bounce" style={{ background: '#e4f4ec', color: '#7ab898' }}>
            {message}
          </div>
        )}

        {/* Cabecera */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #fce4f330 0%, #ede8f825 50%, #e4f4ec20 100%)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: '#7a4d8a' }}>Diario Emocional</h2>
              <p className="text-sm mt-1" style={{ color: '#a89ab8' }}>Registra y revisa tus emociones</p>
            </div>
            {!showForm && !selectedEntry && (
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>
                <Plus size={16} /> Nueva entrada
              </button>
            )}
          </div>
        </div>

        {/* Vista de entrada seleccionada */}
        {selectedEntry && (
          <div style={cardStyle}>
            <button onClick={() => setSelectedEntry(null)} className="flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: '#c4b0e8' }}>
              <ArrowLeft size={16} /> Volver al listado
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>{getColoredIcon(getEmotionDetails(selectedEntry.primary_emotion).icon, getEmotionDetails(selectedEntry.primary_emotion).color, 32)}</div>
                  <div>
                    <h3 className="text-xl font-semibold capitalize" style={{ color: '#7a4d8a' }}>{selectedEntry.primary_emotion}</h3>
                    <p className="text-xs" style={{ color: '#a89ab8' }}>{selectedEntry.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(selectedEntry.intensity)].map((_, i) => (<Heart key={i} size={14} style={{ fill: '#e8a0d4', color: '#e8a0d4' }} />))}
                </div>
              </div>
              
              {selectedEntry.body_text && <div className="p-4 rounded-xl" style={{ background: '#f0e8f8' }}><p className="text-sm" style={{ color: '#7a4d8a' }}>{selectedEntry.body_text}</p></div>}
              {selectedEntry.triggers && <div className="border-l-4 pl-4" style={{ borderColor: '#c4b0e8' }}><p className="text-xs mb-1" style={{ color: '#a89ab8' }}>🔍 Disparadores</p><p className="text-sm" style={{ color: '#7a4d8a' }}>{selectedEntry.triggers}</p></div>}
              {selectedEntry.physical_symptoms && <div className="border-l-4 pl-4" style={{ borderColor: '#e8a0d4' }}><p className="text-xs mb-1" style={{ color: '#a89ab8' }}>💪 Síntomas físicos</p><p className="text-sm" style={{ color: '#7a4d8a' }}>{selectedEntry.physical_symptoms}</p></div>}
              
              <div className="text-xs pt-4" style={{ color: '#c4b0e8' }}>Creado: {new Date(selectedEntry.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Formulario nueva entrada */}
        {showForm && !selectedEntry && (
          <form onSubmit={handleSubmit} style={cardStyle}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#7a4d8a' }}>Nueva entrada</h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} style={{ color: '#a89ab8' }} /></button>
            </div>

            <div className="mb-4"><label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Fecha</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} required /></div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#7a4d8a' }}>¿Cómo te sientes?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {emotions.map((emo) => (
                  <button key={emo.value} type="button" onClick={() => setFormData({ ...formData, primary_emotion: emo.value })} className={`p-2 rounded-lg transition-all ${formData.primary_emotion === emo.value ? 'scale-95' : 'hover:scale-105'}`} style={formData.primary_emotion === emo.value ? { background: emo.bg, border: `2px solid ${emo.color}` } : { background: '#fff9fe', border: `1px solid #e8d8f4` }}>
                    <div className="flex justify-center">{getColoredIcon(emo.icon, formData.primary_emotion === emo.value ? emo.color : '#a89ab8', 20)}</div>
                    <div className="text-xs mt-1 text-center" style={{ color: '#7a4d8a' }}>{emo.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Intensidad</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (<button key={num} type="button" onClick={() => setFormData({ ...formData, intensity: num })} className={`flex-1 py-2 rounded-lg text-sm transition-all ${formData.intensity === num ? 'text-white' : ''}`} style={formData.intensity === num ? { background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8)' } : { background: '#f0e8f8', color: '#a89ab8' }}>{num}</button>))}
              </div>
            </div>

            <div className="mb-4"><label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Disparadores (opcional)</label><input type="text" value={formData.triggers} onChange={(e) => setFormData({ ...formData, triggers: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="¿Qué te llevó a sentirte así?" /></div>
            <div className="mb-4"><label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>¿Qué pasó? (opcional)</label><textarea value={formData.body_text} onChange={(e) => setFormData({ ...formData, body_text: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[80px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="Escribe aquí lo que quieras expresar..." /></div>
            <div className="mb-4"><label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Síntomas físicos (opcional)</label><input type="text" value={formData.physical_symptoms} onChange={(e) => setFormData({ ...formData, physical_symptoms: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="Ej: tensión muscular, palpitaciones..." /></div>

            <button type="submit" className="w-full py-2 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }} disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar emoción'}</button>
          </form>
        )}

        {/* Listado de entradas - CON BARRA LATERAL DE COLOR */}
        {!showForm && !selectedEntry && (
          <div style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}><List size={18} style={{ color: '#c4b0e8' }} /> Mis emociones</h3>
            
            {entries.length === 0 ? (
              <div className="text-center py-12"><div className="text-5xl mb-4">🌸</div><p className="text-sm mb-4" style={{ color: '#a89ab8' }}>No hay entradas aún</p><button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>Escribir primera emoción</button></div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(groupedEntries).map(([month, monthEntries]) => (
                  <div key={month}>
                    <h4 className="text-base font-medium mb-3" style={{ color: '#c4b0e8' }}>{months[month.split('-')[1]]} {month.split('-')[0]}</h4>
                    <div className="grid gap-3">
                      {monthEntries.map((entry) => {
                        const emotion = getEmotionDetails(entry.primary_emotion);
                        return (
                          <button 
                            key={entry.id} 
                            onClick={() => setSelectedEntry(entry)} 
                            className="p-4 rounded-xl text-left w-full transition-all hover:scale-[1.01] overflow-hidden relative"
                            style={{ 
                              background: '#fff9fe', 
                              border: `1px solid ${emotion.color}`,
                              borderLeft: `5px solid ${emotion.color}`
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>{getColoredIcon(emotion.icon, emotion.color, 22)}</div>
                                <div>
                                  <p className="text-sm font-medium capitalize" style={{ color: '#7a4d8a' }}>{entry.primary_emotion}</p>
                                  <p className="text-xs" style={{ color: '#a89ab8' }}>{entry.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(entry.intensity)].map((_, i) => (<Heart key={i} size={10} style={{ fill: '#e8a0d4', color: '#e8a0d4' }} />))}
                              </div>
                            </div>
                            {entry.body_text && (
                              <p className="text-sm mt-2 line-clamp-2" style={{ color: '#a89ab8' }}>
                                {entry.body_text.substring(0, 100)}...
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWithBg>
  );
}

export default EmotionalDiary;