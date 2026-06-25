import React, { useState, useEffect } from 'react';
import { Save, Sun, Moon, Star, Sparkles, Coffee, Bed, Heart, ArrowLeft, Eye, Calendar, X, Plus, List, Smile, Meh, Frown, Zap, Flame, Battery, BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react';
import api from '../services/api';
import LayoutWithBg from '../components/LayoutWithBg';

function DailyJournal() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    morning_reflection: '',
    achievements: '',
    struggles: '',
    gratitude: '',
    evening_reflection: '',
    sleep_hours: 7,
    energy_level: 3,
  });
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('morning');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await api.get('/daily');
      setEntries(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.post('/daily', formData);
      setMessage('Diario guardado con éxito');
      loadEntries();
      setShowForm(false);
      setViewMode('list');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Función mejorada para obtener icono y color de energía
  const getEnergyInfo = (level) => {
    const energyMap = {
      1: { icon: <BatteryLow size={16} />, label: 'Muy baja', color: '#c23131', bg: '#fee2e2', borderColor: '#c23131' },
      2: { icon: <BatteryLow size={16} />, label: 'Baja', color: '#f97316', bg: '#ffe4cc', borderColor: '#f97316' },
      3: { icon: <BatteryMedium size={16} />, label: 'Normal', color: '#917522', bg: '#fef9c3', borderColor: '#c8a849' },
      4: { icon: <BatteryFull size={16} />, label: 'Alta', color: '#608f1b', bg: '#e4f4ec', borderColor: '#608f1b' },
      5: { icon: <Zap size={16} />, label: 'Muy alta', color: '#16863f', bg: '#dcfce7', borderColor: '#16863f' }
    };
    return energyMap[level] || energyMap[3];
  };

  // Función para obtener icono de sueño con color
  const getSleepInfo = (hours) => {
    if (hours < 6) return { icon: <Bed size={14} />, color: '#d841cb', label: 'Poco sueño' };
    if (hours <= 8) return { icon: <Bed size={14} />, color: '#943fad', label: 'Bien dormido' };
    return { icon: <Bed size={14} />, color: '#25a153', label: 'Mucho sueño' };
  };

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
              <h2 className="text-2xl font-semibold" style={{ color: '#7a4d8a' }}>Diario del Día</h2>
              <p className="text-sm mt-1" style={{ color: '#a89ab8' }}>Un espacio para reflexionar, agradecer y crecer</p>
            </div>
            <div className="flex gap-2">
              {!selectedEntry && (
                <>
                  <button onClick={() => { setViewMode('list'); setShowForm(false); setSelectedEntry(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200" style={viewMode === 'list' && !showForm && !selectedEntry ? { background: 'linear-gradient(135deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)', color: '#fff' } : { background: '#f0e8f8', color: '#a89ab8' }}>
                    <Eye size={16} /> Ver diario
                  </button>
                  <button onClick={() => { setShowForm(true); setViewMode('form'); setSelectedEntry(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200" style={showForm ? { background: 'linear-gradient(135deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)', color: '#fff' } : { background: '#f0e8f8', color: '#a89ab8' }}>
                    <Plus size={16} /> Nueva entrada
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vista de entrada seleccionada */}
        {selectedEntry && (
          <div style={cardStyle}>
            <button onClick={() => setSelectedEntry(null)} className="flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: '#c4b0e8' }}>
              <ArrowLeft size={16} /> Volver al listado
            </button>
            
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: '#e8d8f4' }}>
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#a89ab8' }}>
                    <Calendar size={14} /> {selectedEntry.date}
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#7a4d8a' }}>Mi día</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: getEnergyInfo(selectedEntry.energy_level).bg }}>
                    <span style={{ color: getEnergyInfo(selectedEntry.energy_level).color }}>
                      {getEnergyInfo(selectedEntry.energy_level).icon}
                    </span>
                    <span className="text-sm font-medium" style={{ color: getEnergyInfo(selectedEntry.energy_level).color }}>
                      {getEnergyInfo(selectedEntry.energy_level).label}
                    </span>
                    <span className="text-xs" style={{ color: '#a89ab8' }}>({selectedEntry.energy_level}/5)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#f0e8f8' }}>
                    <span style={{ color: getSleepInfo(selectedEntry.sleep_hours).color }}>
                      {getSleepInfo(selectedEntry.sleep_hours).icon}
                    </span>
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>
                      {selectedEntry.sleep_hours} horas
                    </span>
                  </div>
                </div>
              </div>

              {selectedEntry.morning_reflection && (
                <div className="border-l-4 pl-4" style={{ borderColor: '#fcd34d' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun size={16} style={{ color: '#fcd34d' }} />
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>Reflexión de la mañana</span>
                  </div>
                  <p className="text-sm" style={{ color: '#a89ab8' }}>{selectedEntry.morning_reflection}</p>
                </div>
              )}

              {selectedEntry.achievements && (
                <div className="border-l-4 pl-4" style={{ borderColor: '#a8d4b8' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} style={{ color: '#a8d4b8' }} />
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>Mis logros</span>
                  </div>
                  <p className="text-sm" style={{ color: '#a89ab8' }}>{selectedEntry.achievements}</p>
                </div>
              )}

              {selectedEntry.struggles && (
                <div className="border-l-4 pl-4" style={{ borderColor: '#93c5fd' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee size={16} style={{ color: '#93c5fd' }} />
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>Dificultades</span>
                  </div>
                  <p className="text-sm" style={{ color: '#a89ab8' }}>{selectedEntry.struggles}</p>
                </div>
              )}

              {selectedEntry.gratitude && (
                <div className="border-l-4 pl-4" style={{ borderColor: '#e8a0d4' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={16} style={{ color: '#e8a0d4' }} />
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>Agradecimientos</span>
                  </div>
                  <p className="text-sm" style={{ color: '#a89ab8' }}>{selectedEntry.gratitude}</p>
                </div>
              )}

              {selectedEntry.evening_reflection && (
                <div className="border-l-4 pl-4" style={{ borderColor: '#c4b0e8' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Moon size={16} style={{ color: '#c4b0e8' }} />
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>Reflexión de la noche</span>
                  </div>
                  <p className="text-sm" style={{ color: '#a89ab8' }}>{selectedEntry.evening_reflection}</p>
                </div>
              )}

              <div className="text-xs pt-4" style={{ color: '#c4b0e8' }}>
                Creado: {new Date(selectedEntry.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Formulario nueva entrada */}
        {showForm && !selectedEntry && (
          <form onSubmit={handleSubmit} style={cardStyle}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#7a4d8a' }}>Escribir mi día</h3>
              <button type="button" onClick={() => { setShowForm(false); setViewMode('list'); }} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} style={{ color: '#a89ab8' }} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Fecha</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} required />
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { id: 'morning', icon: <Sun size={14} />, label: 'Mañana' },
                { id: 'achievements', icon: <Star size={14} />, label: 'Logros' },
                { id: 'struggles', icon: <Coffee size={14} />, label: 'Dificultades' },
                { id: 'gratitude', icon: <Heart size={14} />, label: 'Gratitud' },
                { id: 'evening', icon: <Moon size={14} />, label: 'Noche' },
              ].map(section => (
                <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeSection === section.id ? 'text-white' : ''}`} style={activeSection === section.id ? { background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8)' } : { background: '#f0e8f8', color: '#a89ab8' }}>
                  {section.icon} {section.label}
                </button>
              ))}
            </div>

            {activeSection === 'morning' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>¿Cómo amaneciste?</label>
                <textarea value={formData.morning_reflection} onChange={(e) => setFormData({ ...formData, morning_reflection: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[100px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="¿Qué intención tienes para hoy?" />
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>¿Qué lograste hoy?</label>
                <textarea value={formData.achievements} onChange={(e) => setFormData({ ...formData, achievements: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[100px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="Cada logro cuenta, por pequeño que sea" />
              </div>
            )}

            {activeSection === 'struggles' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>¿Qué fue difícil hoy?</label>
                <textarea value={formData.struggles} onChange={(e) => setFormData({ ...formData, struggles: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[100px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="Reconocer las dificultades es el primer paso" />
              </div>
            )}

            {activeSection === 'gratitude' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>¿Por qué estás agradecida?</label>
                <textarea value={formData.gratitude} onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[100px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="3 cosas por las que estás agradecida hoy" />
              </div>
            )}

            {activeSection === 'evening' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Horas de sueño</label>
                  <input type="number" step="0.5" value={formData.sleep_hours} onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Nivel de energía</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const energyInfo = getEnergyInfo(num);
                      return (
                        <button key={num} type="button" onClick={() => setFormData({ ...formData, energy_level: num })} className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 ${formData.energy_level === num ? 'text-white' : ''}`} style={formData.energy_level === num ? { background: energyInfo.color } : { background: '#f0e8f8', color: '#a89ab8' }}>
                          {energyInfo.icon}
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>Reflexión del día</label>
                  <textarea value={formData.evening_reflection} onChange={(e) => setFormData({ ...formData, evening_reflection: e.target.value })} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[100px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="¿Cómo fue tu día? ¿Qué aprendiste?" />
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-2 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }} disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar mi día'}
            </button>
          </form>
        )}

        {/* Listado de entradas - CON BARRA LATERAL DE COLOR Y HOVER SIN DESBORDE */}
        {viewMode === 'list' && !showForm && !selectedEntry && (
          <div style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}>
              <List size={18} style={{ color: '#c4b0e8' }} /> Mis días
            </h3>
            
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4"></div>
                <p className="text-sm mb-4" style={{ color: '#a89ab8' }}>No hay entradas aún</p>
                <button onClick={() => { setShowForm(true); setViewMode('form'); }} className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>Escribir mi primer día</button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(groupedEntries).map(([month, monthEntries]) => (
                  <div key={month}>
                    <h4 className="text-base font-medium mb-3" style={{ color: '#c4b0e8' }}>{months[month.split('-')[1]]} {month.split('-')[0]}</h4>
                    <div className="grid gap-3">
                      {monthEntries.map((entry) => {
                        const energyInfo = getEnergyInfo(entry.energy_level);
                        const sleepInfo = getSleepInfo(entry.sleep_hours);
                        return (
                          <button 
                            key={entry.id} 
                            onClick={() => setSelectedEntry(entry)} 
                            className="p-4 rounded-xl text-left w-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                            style={{ 
                              background: '#fff9fe', 
                              border: `1px solid ${energyInfo.borderColor}`,
                              borderLeft: `5px solid ${energyInfo.borderColor}`
                            }}
                          >
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: '#c4b0e8' }} />
                                <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>{entry.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Badge de energía */}
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: energyInfo.bg }}>
                                  <span style={{ color: energyInfo.color }}>{energyInfo.icon}</span>
                                  <span className="text-xs font-medium" style={{ color: energyInfo.color }}>{energyInfo.label}</span>
                                </div>
                                {/* Badge de sueño */}
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: '#f0e8f8' }}>
                                  <span style={{ color: sleepInfo.color }}>{sleepInfo.icon}</span>
                                  <span className="text-xs" style={{ color: '#7a4d8a' }}>{entry.sleep_hours}h</span>
                                </div>
                              </div>
                            </div>
                            {entry.gratitude && (
                              <p className="text-sm line-clamp-2" style={{ color: '#a89ab8' }}>
                                {entry.gratitude.substring(0, 100)}...
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

export default DailyJournal;