import React, { useState, useEffect } from 'react';
import { emotionalService, dailyService } from '../services/api';
import { Calendar, Heart, TrendingUp, Music, Languages, Briefcase, Sparkles, Smile, Meh, Frown, Zap, Flame, Star, Sun } from 'lucide-react';
import LayoutWithBg from '../components/LayoutWithBg';

function Dashboard({ user }) {
  const [recentEmotions, setRecentEmotions] = useState([]);
  const [latestDaily, setLatestDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const loadData = async () => {
    try {
      const [emotions, dailyEntries] = await Promise.all([
        emotionalService.getAll(),
        dailyService.getAll()
      ]);
      setRecentEmotions(emotions.slice(0, 5));
      setLatestDaily(dailyEntries[0]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const emotionConfig = {
    alegria:   { Icon: Smile,  bg: '#fef9c3', border: '#fde68a' },
    calma:     { Icon: Sun,    bg: '#e4f4ec', border: '#a8d4b8' },
    tristeza:  { Icon: Frown,  bg: '#e8f0fe', border: '#93c5fd' },
    ansiedad:  { Icon: Zap,    bg: '#ede8f8', border: '#c4b0e8' },
    ira:       { Icon: Flame,  bg: '#fce4f3', border: '#e8a0d4' },
    neutral:   { Icon: Meh,    bg: '#f3f4f6', border: '#d1d5db' },
    esperanza: { Icon: Star,   bg: '#fef3c7', border: '#fcd34d' },
  };

  const getEmotionCfg = (e) => emotionConfig[e] || emotionConfig.neutral;

  const metas = [
    { icon: <Languages size={18} />, name: 'Aprender Ruso',      progress: 15, gradient: 'linear-gradient(135deg, #a8d4b8, #7ab898)' },
    { icon: <Music size={18} />,     name: 'Aprender Piano',     progress: 8,  gradient: 'linear-gradient(135deg, #e8a0d4, #c4b0e8)' },
    { icon: <Briefcase size={18} />, name: 'Conseguir Trabajo',  progress: 30, gradient: 'linear-gradient(135deg, #c4b0e8, #a8d4b8)' },
  ];

  const card = {
    background: 'linear-gradient(160deg, #fff9fe 0%, #f7f9ff 50%, #f4fbf7 100%)',
    border: '1px solid #e8d8f4',
    borderRadius: 20,
    padding: '1.5rem',
  };

  return (
    <LayoutWithBg>
      <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
        {/* Bienvenida */}
        <div style={{ ...card, background: 'linear-gradient(135deg, #fce4f330 0%, #ede8f825 50%, #e4f4ec20 100%)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1" style={{ color: '#7a4d8a' }}>
                {getGreeting()}, {user?.username}
              </h2>
              <p className="text-sm" style={{ color: '#7142a7' }}>
                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs mt-2" style={{ color: '#a76daa' }}>
                Recuerda: cada pequeño paso cuenta. Hoy es un nuevo comienzo.
              </p>
            </div>
            <div className="flex gap-1 self-start mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e8a0d4' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#b8d4a8' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#c4b0e8' }} />
            </div>
          </div>
        </div>

        {/* Cómo te sientes */}
        <div style={card}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}>
            <Heart size={18} style={{ color: '#e8a0d4' }} />
            ¿Cómo te sientes ahora mismo?
          </h3>
          <div className="flex gap-2 flex-wrap">
            {['alegria', 'calma', 'tristeza', 'ansiedad', 'esperanza'].map(emo => {
              const cfg = getEmotionCfg(emo);
              const EmotionIcon = cfg.Icon; // Referencia estática segura para React
              return (
                <button
                  key={emo}
                  onClick={() => window.location.href = '/emotional'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize hover:scale-105"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: '#7a4d8a' }}
                >
                  <span style={{ color: cfg.border }}>
                    <EmotionIcon size={16} />   
                  </span>
                  {emo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Última reflexión */}
        {latestDaily && (
          <div style={{ ...card, borderLeft: '3px solid #c4b0e8' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: '#e8a0d4' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#7a4d8a' }}>Tu última reflexión</h3>
            </div>
            <p className="text-sm italic" style={{ color: '#a89ab8' }}>
              "{latestDaily.evening_reflection?.substring(0, 120) || latestDaily.morning_reflection?.substring(0, 120) || 'Sigue escribiendo tu día...'}"
            </p>
            <p className="text-xs mt-2" style={{ color: '#c4b0e8' }}>{latestDaily.date}</p>
          </div>
        )}

        {/* Metas */}
        <div style={card}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}>
            <TrendingUp size={18} style={{ color: '#a8d4b8' }} />
            Mis metas
          </h3>
          <div className="space-y-4">
            {metas.map((meta, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2" style={{ color: '#c4b0e8' }}>
                    {meta.icon}
                    <span className="text-sm font-medium" style={{ color: '#7a4d8a' }}>{meta.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#a89ab8' }}>{meta.progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: '#f0e8f8' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${meta.progress}%`, background: meta.gradient }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emociones recientes */}
        <div style={card}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}>
            <Calendar size={18} style={{ color: '#c4b0e8' }} />
            Emociones recientes
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#a89ab8' }}>Cargando...</p>
            </div>
          ) : recentEmotions.length === 0 ? (
            <div className="text-center py-8">
              <Heart size={36} className="mx-auto mb-3" style={{ color: '#e8d8f4' }} />
              <p className="text-sm mb-4" style={{ color: '#a89ab8' }}>No hay entradas aún</p>
              <button
                onClick={() => window.location.href = '/emotional'}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)' }}
              >
                Escribir primera emoción
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEmotions.map((emotion, idx) => {
                const cfg = getEmotionCfg(emotion.primary_emotion);
                const RecentIcon = cfg.Icon; // Referencia estática segura para React
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    onClick={() => window.location.href = '/emotional'}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: cfg.border }}>
                        <RecentIcon size={20} />  
                      </span>
                      <div>
                        <p className="text-sm font-medium capitalize" style={{ color: '#7a4d8a' }}>{emotion.primary_emotion}</p>
                        <p className="text-xs" style={{ color: '#a89ab8' }}>{emotion.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(emotion.intensity)].map((_, i) => (
                        <Heart key={i} size={12} style={{ fill: '#e8a0d4', color: '#e8a0d4' }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Frase */}
        <div className="text-center py-4">
          <p className="text-sm italic max-w-md mx-auto" style={{ color: '#a89ab8' }}>
            "No tienes que ver todo el camino, solo da el siguiente paso."
          </p>
        </div>
      </div>
    </LayoutWithBg>
  );
}

export default Dashboard;