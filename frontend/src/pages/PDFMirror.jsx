import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, MessageSquare, X, BookOpen, Sparkles, Maximize2, Minimize2, Sidebar, ChevronRight } from 'lucide-react';
import { pdfService } from '../services/api';
import LayoutWithBg from '../components/LayoutWithBg';

function PDFMirror() {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfExpanded, setPdfExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    try {
      const data = await pdfService.getAll();
      setPdfs(data);
    } catch (error) {
      console.error('Error cargando PDFs:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setMessage('❌ Solo se permiten archivos PDF');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    try {
      await pdfService.upload(file);
      setMessage('✨ PDF subido exitosamente ✨');
      loadPdfs();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al subir el PDF');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePdf = async (pdfId) => {
    if (confirm('¿Eliminar este PDF? Las anotaciones también se eliminarán.')) {
      try {
        await pdfService.delete(pdfId);
        setMessage('📄 PDF eliminado');
        if (selectedPdf?.id === pdfId) {
          setSelectedPdf(null);
        }
        loadPdfs();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Error al eliminar');
      }
    }
  };

  const loadAnnotations = async (pdfId) => {
    try {
      const data = await pdfService.getAnnotations(pdfId);
      setAnnotations(data);
    } catch (error) {
      console.error('Error cargando anotaciones:', error);
    }
  };

  const selectPdf = async (pdf) => {
    setSelectedPdf(pdf);
    await loadAnnotations(pdf.id);
    setPdfExpanded(false);
    setShowNotes(true);
  };

  const saveAnnotation = async () => {
    if (!reflectionText.trim()) return;

    try {
      await pdfService.saveAnnotation(selectedPdf.id, {
        page_number: 1,
        original_text: selectedText,
        reflection_text: reflectionText,
      });
      setMessage('✨ Anotación guardada ✨');
      await loadAnnotations(selectedPdf.id);
      setShowAnnotationModal(false);
      setSelectedText('');
      setReflectionText('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al guardar anotación');
    }
  };

  const cardStyle = {
    background: 'linear-gradient(160deg, #fff9fe 0%, #f7f9ff 50%, #f4fbf7 100%)',
    border: '1px solid #e8d8f4',
    borderRadius: 20,
    padding: '1.5rem',
  };

  return (
    <LayoutWithBg>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
        {/* Mensaje flotante */}
        {message && (
          <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-bounce" style={{ background: '#e4f4ec', color: '#7ab898' }}>
            {message}
          </div>
        )}

        {/* Cabecera */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #fce4f330 0%, #ede8f825 50%, #e4f4ec20 100%)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: '#7a4d8a' }}>📖 PDF Espejo</h2>
              <p className="text-sm mt-1" style={{ color: '#a89ab8' }}>Sube tus lecturas y escribe tus reflexiones al lado</p>
              <p className="text-xs mt-1 italic" style={{ color: '#c4b0e8' }}>"La lectura es un espejo donde te encuentras a ti misma"</p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>
              <Upload size={16} />
              {uploading ? 'Subiendo...' : 'Subir PDF'}
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Selector de PDFs */}
        {pdfs.length > 0 && !selectedPdf && (
          <div style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7a4d8a' }}>
              <BookOpen size={18} style={{ color: '#c4b0e8' }} /> Mis lecturas
            </h3>
            <div className="grid gap-3">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01]" style={{ background: '#fff9fe', border: '1px solid #e8d8f4' }}>
                  <div className="flex items-center gap-3">
                    <BookOpen size={22} style={{ color: '#c4b0e8' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#7a4d8a' }}>{pdf.original_name}</p>
                      <p className="text-xs" style={{ color: '#a89ab8' }}>Subido: {new Date(pdf.upload_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => selectPdf(pdf)} className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)', color: '#fff' }}>Leer</button>
                    <button onClick={() => handleDeletePdf(pdf.id)} className="p-2 rounded-xl transition-all hover:bg-rose/20" style={{ color: '#e8a0d4' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visor del PDF seleccionado */}
        {selectedPdf && (
          <div style={cardStyle}>
            {/* Barra de control */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div>
                <button onClick={() => setSelectedPdf(null)} className="flex items-center gap-1 text-sm mb-2 transition-colors" style={{ color: '#c4b0e8' }}>← Volver a mis lecturas</button>
                <h3 className="text-lg font-semibold" style={{ color: '#7a4d8a' }}>{selectedPdf.original_name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all" style={{ background: showNotes ? 'linear-gradient(135deg, #e8a0d4, #c4b0e8)' : '#f0e8f8', color: showNotes ? '#fff' : '#a89ab8' }}>
                  <Sidebar size={14} /> {showNotes ? 'Ocultar notas' : 'Mostrar notas'}
                </button>
                <button onClick={() => setPdfExpanded(!pdfExpanded)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all" style={{ background: pdfExpanded ? 'linear-gradient(135deg, #e8a0d4, #c4b0e8)' : '#f0e8f8', color: pdfExpanded ? '#fff' : '#a89ab8' }}>
                  {pdfExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {pdfExpanded ? 'Reducir' : 'Expandir'}
                </button>
                <button onClick={() => setShowAnnotationModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white transition-all" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>
                  <MessageSquare size={14} /> Nueva reflexión
                </button>
              </div>
            </div>

            {/* Visor con layout dinámico - PDF MÁS ALTO */}
            <div className={`flex gap-6 transition-all duration-300 ${pdfExpanded ? 'flex-col' : 'flex-col lg:flex-row'}`}>
              {/* Visor del PDF - ALTURA AUMENTADA */}
              <div className={`${pdfExpanded ? 'w-full' : showNotes ? 'lg:w-3/5' : 'w-full'} bg-gray-100 rounded-xl p-4 overflow-auto`} style={{ minHeight: '650px', maxHeight: pdfExpanded ? 'calc(100vh - 200px)' : '700px' }}>
                <embed 
                  src={`https://diario-ky32.onrender.com/api/pdfs/view/${selectedPdf.id}`} 
                  type="application/pdf" 
                  width="100%" 
                  height="100%" 
                  className="rounded-lg" 
                  style={{ minHeight: '600px' }} 
                />
              </div>

              {/* Panel de reflexiones (condicional) - también más alto */}
              {!pdfExpanded && showNotes && (
                <div className={`${pdfExpanded ? 'hidden' : 'lg:w-2/5'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} style={{ color: '#e8a0d4' }} />
                    <h4 className="text-base font-semibold" style={{ color: '#7a4d8a' }}>Mis reflexiones</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0e8f8', color: '#a89ab8' }}>{annotations.length}</span>
                  </div>
                  
                  {annotations.length === 0 ? (
                    <div className="text-center py-12 rounded-xl" style={{ background: '#f0e8f8', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <MessageSquare size={40} className="mx-auto mb-3" style={{ color: '#c4b0e8' }} />
                      <p className="text-sm mb-3" style={{ color: '#a89ab8' }}>No hay reflexiones aún</p>
                      <button onClick={() => setShowAnnotationModal(true)} className="text-sm transition-colors" style={{ color: '#c4b0e8' }}>Escribe tu primera reflexión →</button>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '650px' }}>
                      {annotations.map((ann) => (
                        <div key={ann.id} className="p-3 rounded-xl transition-all hover:shadow-md" style={{ background: '#fff9fe', border: '1px solid #e8d8f4', borderLeft: `3px solid #c4b0e8` }}>
                          <div className="text-xs mb-1" style={{ color: '#a89ab8' }}>{new Date(ann.created_at).toLocaleDateString()}</div>
                          {ann.original_text && <div className="italic text-xs mb-2 p-2 rounded" style={{ background: '#f0e8f8', color: '#a89ab8' }}>"{ann.original_text.substring(0, 100)}..."</div>}
                          <p className="text-sm" style={{ color: '#7a4d8a' }}>{ann.reflection_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Indicador de notas ocultas cuando están cerradas */}
            {!pdfExpanded && !showNotes && (
              <div className="mt-4 text-center">
                <button onClick={() => setShowNotes(true)} className="flex items-center gap-1 mx-auto text-sm transition-colors" style={{ color: '#c4b0e8' }}>
                  <ChevronRight size={14} /> Mostrar reflexiones ({annotations.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal para nueva reflexión */}
        {showAnnotationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6" style={{ ...cardStyle, background: '#fff' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#7a4d8a' }}>✨ Nueva reflexión</h3>
                <button onClick={() => setShowAnnotationModal(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} style={{ color: '#a89ab8' }} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>📄 Texto que quieres reflejar</label>
                  <textarea value={selectedText} onChange={(e) => setSelectedText(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[80px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="¿Qué frase o párrafo te impactó?" />
                  <p className="text-xs mt-1" style={{ color: '#a89ab8' }}>Copia y pega el texto que quieras reflexionar</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7a4d8a' }}>📝 Tu reflexión (el espejo)</label>
                  <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all min-h-[120px]" style={{ borderColor: '#e8d8f4', background: '#fff9fe' }} placeholder="¿Qué te hace sentir este texto? ¿Qué recuerdos o pensamientos te trae?" autoFocus />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowAnnotationModal(false)} className="flex-1 px-4 py-2 rounded-xl border transition-all" style={{ borderColor: '#e8d8f4', color: '#a89ab8' }}>Cancelar</button>
                  <button onClick={saveAnnotation} className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition-all" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }} disabled={!reflectionText.trim()}>Guardar reflexión</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay PDFs */}
        {pdfs.length === 0 && !selectedPdf && (
          <div style={cardStyle} className="text-center py-12">
            <div className="text-6xl mb-4">📚🌸</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#7a4d8a' }}>Tu biblioteca está vacía</h3>
            <p className="text-sm mb-4" style={{ color: '#a89ab8' }}>Sube tus PDFs de lectura y comienza a escribir tus reflexiones</p>
            <label className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)' }}>
              <Upload size={16} /> Subir mi primer PDF
              <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>
    </LayoutWithBg>
  );
}

export default PDFMirror;