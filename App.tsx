
import React, { useState, useRef, useEffect } from 'react';
import { GenerationSettings, GenerationJob, TextStyles, HistoryItem } from './types';
import { generateLogo, editLogo } from './services/geminiService';

const STYLE_LIBRARY = [
  { name: '몰랐던', url: 'https://i.imghippo.com/files/QXz1716bsI.jpg', description: 'Bold, expressive modern brush strokes with high kinetic energy and sharp terminals.' },
  { name: '사랑하자자', url: 'https://i.imghippo.com/files/tcx4771jqI.jpg', description: 'Soft, rounded, friendly handwriting-style brush strokes with a warm, personal feel.' },
  { name: '낭만', url: 'https://i.imghippo.com/files/Dtv3663fQ.jpg', description: 'Elegant, flowing, classic cursive-like brush calligraphy with sophisticated loops.' },
  { name: '츄파춥스', url: 'https://i.imghippo.com/files/siMq2751jvw.jpg', description: 'Playful, thick, pop-art style rounded lettering with a vibrant and energetic personality.' },
  { name: '진짜짜', url: 'https://i.imghippo.com/files/YhaK3908nmM.jpg', description: 'Rough, dry brush texture with powerful, artisanal movements and expressive splatters.' },
  { name: '세일보장', url: 'https://i.imghippo.com/files/OrPF5894vng.jpg', description: 'Industrial, blocky, high-impact functional lettering suitable for commercial stability.' },
  { name: '페스타', url: 'https://i.imghippo.com/files/Ulq5310wIE.jpg', description: 'Festive, decorative, rhythmic brush script with a sense of movement and celebration.' },
  { name: '예술마을', url: 'https://i.imghippo.com/files/Qq7034HCA.jpg', description: 'Artistic, organic, hand-drawn felt-pen style with a creative and community-oriented vibe.' },
  { name: '브리저튼', url: 'https://i.imghippo.com/files/KZG7463BWI.jpg', description: 'Classical, high-contrast serif-inspired elegant calligraphy for luxury branding.' },
  { name: '소일런트', url: 'https://i.imghippo.com/files/TTCe4623.jpg', description: 'Minimalist, balanced, clean modern monoline with architectural precision.' },
  { name: '임팩트', url: 'https://i.imghippo.com/files/GBI2725Rs.jpg', description: 'Strong, heavy-weighted, architectural bold style with solid stability.' },
  { name: '당신', url: 'https://i.imghippo.com/files/IkK7904iI.jpg', description: 'Intimate, thin-stroke personal signature style with a delicate and refined touch.' },
  { name: '날개', url: 'https://i.imghippo.com/files/paEV8674jN.jpg', description: 'Light, airy, wispy strokes with flying-white effects and ethereal grace.' },
  { name: '설날', url: 'https://i.imghippo.com/files/kIbC6108bo.jpg', description: 'Traditional, ceremonial, perfectly balanced oriental ink brush for cultural prestige.' },
  { name: '술탄', url: 'https://i.imghippo.com/files/Dt1106jQU.jpg', description: 'Exotic, sharp, high-pressure calligraphic strokes with unique cultural geometry.' },
  { name: '뉴이어어', url: 'https://i.imghippo.com/files/lr1020dGk.jpg', description: 'Festive New Year themed calligraphy with celebratory energy.' },
];

const App: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('New Year<br>최고의 찬스');
  const [textStyles, setTextStyles] = useState<TextStyles>({
    size: 'h2',
    bold: false,
    align: 'center',
    color: '#000000'
  });
  const [concept, setConcept] = useState('');
  const [addPrompt, setAddPrompt] = useState('');
  const [mode, setMode] = useState<'reference' | 'auto'>('reference');
  const [styleRefs, setStyleRefs] = useState<string[]>([]);
  const [colorRef, setColorRef] = useState<string | null>(null);
  const [textureRef, setTextureRef] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    strokeThickness: 0.5,
    spacing: 0.5,
    slant: 0,
    inkBleed: 0.2,
    contrast: 0.8,
    background: 'white' 
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [results, setResults] = useState<HistoryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<string[]>([]);
  const libraryBase64Map = useRef<Record<string, string>>({});

  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [viewItems, setViewItems] = useState<HistoryItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const getFontSizeStyle = (size: TextStyles['size']) => {
    switch(size) {
      case 'h1': return '4.5rem';
      case 'h2': return '3.5rem';
      case 'h3': return '2.5rem';
      case 'h4': return '1.8rem';
      case 'h5': return '1.4rem';
      default: return '3.5rem';
    }
  };

  // Capture selection whenever the user interacts with the editor
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  };

  const applyStyleToSelection = (style: 'color' | 'fontSize' | 'fontWeight', value: string) => {
    restoreSelection();
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().trim().length > 0;

    if (!hasSelection) {
      // If nothing is highlighted, update global styles which act as the default for new text
      if (style === 'color') setTextStyles(prev => ({ ...prev, color: value }));
      if (style === 'fontSize') {
        const sizeMap: Record<string, TextStyles['size']> = { 'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'h4': 'h4', 'h5': 'h5' };
        setTextStyles(prev => ({ ...prev, size: sizeMap[value] || 'h2' }));
      }
      if (style === 'fontWeight') setTextStyles(prev => ({ ...prev, bold: !textStyles.bold }));
      return;
    }

    // Apply specific styles to the highlighted portion
    if (style === 'color') {
      document.execCommand('foreColor', false, value);
    } else if (style === 'fontWeight') {
      document.execCommand('bold', false);
    } else if (style === 'fontSize') {
      // We manually wrap with a span for precise CSS control since execCommand fontSize uses 1-7 integers
      const range = selection!.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = getFontSizeStyle(value as any);
      try {
        range.surroundContents(span);
      } catch (e) {
        // Fallback for complex selections (e.g. multi-node)
        document.execCommand('fontSize', false, '5'); 
      }
    }
    
    // Sync the editor's innerHTML back to our state
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    saveSelection(); // Update saved range after change
  };

  const handlePickColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyStyleToSelection('color', e.target.value);
  };

  const handleLibraryToggle = async (item: typeof STYLE_LIBRARY[0]) => {
    if (selectedLibraryUrls.includes(item.url)) {
      // Remove logic
      const base64ToRemove = libraryBase64Map.current[item.url];
      if (base64ToRemove) {
        setStyleRefs(prev => prev.filter(ref => ref !== base64ToRemove));
      }
      setSelectedLibraryUrls(prev => prev.filter(u => u !== item.url));
    } else {
      // Add logic
      setSelectedLibraryUrls(prev => [...prev, item.url]);
      
      let base64 = libraryBase64Map.current[item.url];
      if (!base64) {
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(item.url)}`;
          const r = await fetch(proxyUrl); 
          const b = await r.blob();
          base64 = await new Promise<string>(rl => { 
            const rd = new FileReader(); 
            rd.onloadend = () => rl(rd.result as string); 
            rd.readAsDataURL(b); 
          });
          libraryBase64Map.current[item.url] = base64;
        } catch (e) {
          console.error("Failed to load library style", e);
          return;
        }
      }
      setStyleRefs(p => [...p, base64 as string]);
    }
  };

  const handleSizeChange = (size: TextStyles['size']) => {
    applyStyleToSelection('fontSize', size);
  };

  const handleBoldToggle = () => {
    applyStyleToSelection('fontWeight', 'bold');
  };

  const handleGenerate = async (size: '1K' | '4K' = '1K') => {
    setIsGenerating(true);
    setGenerationStep('Decoding Visual Hierarchy...');
    setError(null);
    setResults([]); 
    
    try {
      const currentHtml = editorRef.current?.innerHTML || htmlContent;
      const job: GenerationJob = {
        mode, text: currentHtml, textStyles, concept, addPrompt,
        references: { styleRefs, colorRef: colorRef || undefined, textureRef: textureRef || undefined },
        settings
      };

      const libraryMetadata = STYLE_LIBRARY.map(s => ({ name: s.name, description: s.description, url: s.url }));
      const targets = styleRefs.length > 0 ? styleRefs : [null];
      
      for (let i = 0; i < targets.length; i++) {
        setGenerationStep(`Synthesizing Artistic Object (${i+1}/${targets.length})...`);
        const imageUrl = await generateLogo(job, targets[i] || '', size);
        const item: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          imageUrl, timestamp: Date.now(),
          text: currentHtml.replace(/<[^>]*>?/gm, ''),
          resolution: size, jobSnapshot: JSON.parse(JSON.stringify(job))
        };
        setResults(prev => [...prev, item]);
        setHistory(prev => [item, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Calligraphy synthesis failed.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleUpgrade4K = async (item: HistoryItem) => {
    setIsGenerating(true);
    setGenerationStep('Expanding Detail to 4K...');
    try {
      const libraryMetadata = STYLE_LIBRARY.map(s => ({ name: s.name, description: s.description, url: s.url }));
      const imageUrl = await generateLogo(item.jobSnapshot, item.jobSnapshot.references.styleRefs[0] || '', '4K');
      const upgraded: HistoryItem = { ...item, id: Math.random().toString(36).substr(2, 9), imageUrl, resolution: '4K', timestamp: Date.now() };
      setHistory(prev => [upgraded, ...prev]);
      if (selectedItemIdx !== null) {
        const newView = [...viewItems];
        newView[selectedItemIdx] = upgraded;
        setViewItems(newView);
      }
    } catch (err: any) { setError(err.message); } finally { setIsGenerating(false); }
  };

  const handleEdit = async () => {
    if (selectedItemIdx === null) return;
    const item = viewItems[selectedItemIdx];
    setIsEditing(true);
    try {
      const mask = canvasRef.current?.toDataURL('image/png') || null;
      const imageUrl = await editLogo(item.imageUrl, mask, editInstruction);
      const edited: HistoryItem = { ...item, id: Math.random().toString(36).substr(2, 9), imageUrl, timestamp: Date.now() };
      setHistory(prev => [edited, ...prev]);
      const newView = [...viewItems];
      newView[selectedItemIdx] = edited;
      setViewItems(newView);
      setEditInstruction('');
    } catch (err: any) { setError(err.message); } finally { setIsEditing(false); }
  };

  const DropZone = ({ label, values, onClear, onAdd, type, libraryButton }: any) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</label>
        <div className="flex gap-2 items-center">{libraryButton}</div>
      </div>
      <div className="flex flex-wrap gap-3">
        {values.map((v: string, i: number) => (
          <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl bg-black/40">
            <img src={v} className="w-full h-full object-cover" />
            <button onClick={() => onClear(i)} className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
            </button>
          </div>
        ))}
        <label className="w-full h-28 rounded-2xl border-2 border-dashed border-gray-800 bg-black/20 hover:border-blue-500 hover:bg-black/40 flex flex-col items-center justify-center cursor-pointer transition-all">
          <input type="file" hidden onChange={e => e.target.files?.[0] && onAdd(e.target.files[0], type)} />
          <svg className="w-7 h-7 mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={1.5}/></svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Import Ref</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-gray-100 flex overflow-hidden h-screen font-sans">
      {needsApiKey && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0d0d0d] border border-gray-800 rounded-[3rem] p-12 text-center space-y-10">
            <h2 className="text-4xl font-black tracking-tighter">Identity Verified</h2>
            <button onClick={handleOpenKeySelector} className="w-full py-5 bg-blue-600 rounded-3xl font-black tracking-[0.2em]">SELECT AUTH KEY</button>
          </div>
        </div>
      )}

      {isLibraryOpen && (
        <div className="fixed inset-0 z-[210] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="max-w-5xl w-full bg-[#080808] border border-gray-800 rounded-[3rem] p-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Style Library</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select multiple artistic references for generation</p>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto custom-scrollbar pr-4 pb-10">
              {STYLE_LIBRARY.map((item, idx) => {
                const isSelected = selectedLibraryUrls.includes(item.url);
                return (
                  <button 
                    key={idx} 
                    onClick={() => handleLibraryToggle(item)} 
                    className={`group relative bg-white/5 p-3 rounded-3xl border transition-all duration-300 ${isSelected ? 'border-blue-500 bg-blue-500/10 scale-[0.98]' : 'border-white/5 hover:border-blue-500/50 hover:bg-white/10'}`}
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-2 relative">
                      <img src={item.url} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'opacity-50' : 'opacity-100'}`} />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-[2px]">
                          <svg className="w-10 h-10 text-white drop-shadow-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-left px-1">
                      <p className="text-[11px] font-black uppercase text-gray-300 group-hover:text-white transition-colors">{item.name}</p>
                      <p className="text-[8px] text-gray-600 font-medium line-clamp-1 group-hover:text-gray-400">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-8 border-t border-white/5 flex justify-between items-center bg-[#080808] sticky bottom-0">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {selectedLibraryUrls.length} Reference{selectedLibraryUrls.length !== 1 ? 's' : ''} Selected
              </span>
              <button onClick={() => setIsLibraryOpen(false)} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-blue-600/20">
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-[440px] border-r border-white/5 bg-[#080808] overflow-y-auto custom-scrollbar p-8 flex flex-col h-full shrink-0 shadow-2xl">
        <header className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-2xl shadow-blue-500/20">C</div>
          <h1 className="text-2xl font-black tracking-tighter text-white italic">CalliLogo</h1>
        </header>

        <section className="space-y-10 pb-16">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Typographic Canvas</h3>
            </div>

            <div className="bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
                <select 
                  value={textStyles.size} 
                  onChange={e => handleSizeChange(e.target.value as any)} 
                  className="bg-transparent text-[10px] font-black outline-none text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white"
                >
                  <option value="h1">H1 - Huge</option>
                  <option value="h2">H2 - Large</option>
                  <option value="h3">H3 - Medium</option>
                  <option value="h4">H4 - Small</option>
                  <option value="h5">H5 - Fine</option>
                </select>
                <button onClick={handleBoldToggle} className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 ${textStyles.bold ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600'}`}>B</button>
                <div className="flex items-center bg-white/5 rounded-xl p-0.5">
                  <button onClick={() => setTextStyles({...textStyles, align: 'left'})} className={`p-2 rounded-lg ${textStyles.align === 'left' ? 'text-blue-500 bg-white/10' : 'text-gray-700'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth={2.5}/></svg></button>
                  <button onClick={() => setTextStyles({...textStyles, align: 'center'})} className={`p-2 rounded-lg ${textStyles.align === 'center' ? 'text-blue-500 bg-white/10' : 'text-gray-700'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M7 12h10M4 18h16" strokeWidth={2.5}/></svg></button>
                  <button onClick={() => setTextStyles({...textStyles, align: 'right'})} className={`p-2 rounded-lg ${textStyles.align === 'right' ? 'text-blue-500 bg-white/10' : 'text-gray-700'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M10 12h10M4 18h16" strokeWidth={2.5}/></svg></button>
                </div>
                <div className="relative ml-auto group">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg cursor-pointer hover:scale-110 transition-transform" style={{backgroundColor: textStyles.color}} onClick={() => colorPickerRef.current?.click()} />
                  <input type="color" ref={colorPickerRef} value={textStyles.color} onChange={handlePickColor} className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none" />
                </div>
              </div>
              <div className="p-10 min-h-[300px] flex items-center justify-center bg-white/95 text-black">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                  onSelect={saveSelection}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    textAlign: textStyles.align,
                    fontSize: getFontSizeStyle(textStyles.size),
                    color: textStyles.color,
                    fontWeight: textStyles.bold ? 'bold' : 'normal',
                    lineHeight: '1.2',
                    fontFamily: "'Pretendard', sans-serif",
                    outline: 'none',
                    width: '100%',
                    minHeight: '200px',
                    wordBreak: 'break-word'
                  }}
                  className="custom-scrollbar"
                />
              </div>
              <div className="px-5 py-3 bg-[#080808] flex justify-between items-center border-t border-white/5">
                <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">Character-Level Control</span>
                <button onClick={() => setHtmlContent('Type here...')} className="text-[8px] text-red-500/60 font-black uppercase tracking-widest">Clear</button>
              </div>
            </div>
            <p className="text-[9px] text-gray-500 mt-3 italic px-2">Highlight text to change specific colors and sizes.</p>
          </div>

          <DropZone label="Style References" values={styleRefs} onClear={(i: number) => setStyleRefs(styleRefs.filter((_, idx) => idx !== i))} onAdd={(f: File) => { const rd = new FileReader(); rd.onload = (e) => setStyleRefs(p => [...p, e.target?.result as string]); rd.readAsDataURL(f); }} type="style" libraryButton={<button onClick={() => setIsLibraryOpen(true)} className="px-4 py-1.5 bg-blue-600 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-500/20">Styles</button>} />
          
          <div className="grid grid-cols-2 gap-8">
            <DropZone label="Palette" values={colorRef ? [colorRef] : []} onClear={() => setColorRef(null)} onAdd={(f: File) => { const rd = new FileReader(); rd.onload = (e) => setColorRef(e.target?.result as string); rd.readAsDataURL(f); }} type="color" />
            <DropZone label="Material" values={textureRef ? [textureRef] : []} onClear={() => setTextureRef(null)} onAdd={(f: File) => { const rd = new FileReader(); rd.onload = (e) => setTextureRef(e.target?.result as string); rd.readAsDataURL(f); }} type="texture" />
          </div>

          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Directives</h3>
            <input type="text" value={addPrompt} onChange={e => setAddPrompt(e.target.value)} placeholder="Extra design mood, context..." className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none shadow-inner" />
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6">
             {[{l: 'Stroke', k: 'strokeThickness'}, {l: 'Spacing', k: 'spacing'}, {l: 'Ink Bleed', k: 'inkBleed'}].map(s => (
               <div key={s.k}>
                 <div className="flex justify-between text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest"><span>{s.l}</span><span className="text-blue-500">{Math.round((settings as any)[s.k] * 100)}%</span></div>
                 <input type="range" min="0" max="1" step="0.01" value={(settings as any)[s.k]} onChange={e => setSettings({...settings, [s.k]: parseFloat(e.target.value)})} className="w-full h-1.5 bg-black border border-white/5 rounded-full appearance-none accent-blue-600" />
               </div>
             ))}
          </div>
        </section>

        <div className="mt-auto pt-10 sticky bottom-0 bg-[#080808]/90 backdrop-blur-md pb-4">
          <button onClick={() => handleGenerate('1K')} disabled={isGenerating || !htmlContent.trim()} className={`w-full py-6 rounded-3xl font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all uppercase ${isGenerating ? 'bg-gray-900 text-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl'}`}>
            {isGenerating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Synthesize Artistic Logo'}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#020202] relative flex flex-col items-center justify-center p-16 overflow-y-auto">
        {!isGenerating && results.length === 0 && <div className="text-center opacity-[0.03] select-none pointer-events-none"><h2 className="text-[15vw] font-black tracking-tighter italic uppercase">Master</h2></div>}
        {isGenerating && results.length === 0 && (
          <div className="text-center space-y-12">
            <div className="w-56 h-56 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto flex items-center justify-center"><div className="w-40 h-40 border border-indigo-500/10 border-b-indigo-500 rounded-full animate-spin" style={{animationDuration: '8s'}} /></div>
            <p className="text-xl font-light tracking-[0.4em] text-white uppercase italic">{generationStep}</p>
          </div>
        )}
        <div className={`grid gap-12 w-full max-w-7xl ${results.length === 1 ? 'grid-cols-1 max-w-3xl' : 'grid-cols-2 xl:grid-cols-3'}`}>
          {results.map((item, idx) => (
            <div key={item.id} onClick={() => { setViewItems(results); setSelectedItemIdx(idx); }} className="aspect-square bg-black rounded-[3rem] overflow-hidden border border-white/5 cursor-pointer hover:scale-[1.03] transition-all group relative shadow-2xl">
              <img src={item.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                <span className="text-[11px] font-black tracking-[0.4em] text-white border-2 border-white/30 px-8 py-4 uppercase">View Master</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside className="w-[300px] border-l border-white/5 bg-[#080808] overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 shrink-0 shadow-2xl">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">History</h3>
        <div className="space-y-5">
          {history.map((item, idx) => (
            <div key={item.id} onClick={() => { setViewItems(history); setSelectedItemIdx(idx); }} className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer group hover:border-blue-500/40 transition-all shadow-xl">
              <img src={item.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100" />
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white/60">#{history.length - idx}</div>
            </div>
          ))}
        </div>
      </aside>

      {selectedItemIdx !== null && (
        <div className="fixed inset-0 z-[150] bg-black/99 backdrop-blur-3xl flex flex-col">
          <div className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-black/50">
            <button onClick={() => setSelectedItemIdx(null)} className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg></button>
            <div className="flex gap-4">
               <button onClick={() => {const l=document.createElement('a'); l.href=viewItems[selectedItemIdx!].imageUrl; l.download='callilogo.png'; l.click();}} className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase">Download PNG</button>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative flex items-center justify-center p-16 overflow-hidden">
                <img src={viewItems[selectedItemIdx].imageUrl} className="max-h-[80vh] shadow-[0_0_100px_rgba(0,0,0,1)] rounded-3xl" />
            </div>
            <div className="w-[420px] border-l border-white/5 bg-[#080808] p-10 flex flex-col gap-10 shadow-2xl">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Refine Object</h4>
              <textarea value={editInstruction} onChange={e => setEditInstruction(e.target.value)} className="w-full bg-black border border-white/5 rounded-[2rem] p-8 text-xs h-48 outline-none custom-scrollbar" placeholder="Adjust lighting, modify specific stroke..." />
              <button disabled={isEditing || !editInstruction} onClick={handleEdit} className="w-full py-6 rounded-3xl font-black text-[11px] tracking-[0.2em] bg-blue-600 text-white shadow-xl shadow-blue-500/10">Apply Refinement</button>
              <div className="mt-auto pt-10 border-t border-white/5">
                <button disabled={viewItems[selectedItemIdx].resolution === '4K' || isGenerating} onClick={() => handleUpgrade4K(viewItems[selectedItemIdx])} className={`w-full py-8 rounded-[2.5rem] font-black text-[11px] tracking-[0.4em] ${viewItems[selectedItemIdx].resolution === '4K' ? 'bg-green-600/10 text-green-500' : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl shadow-purple-500/10'}`}>
                  {viewItems[selectedItemIdx].resolution === '4K' ? '4K MASTERED' : 'UPGRADE TO 4K'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[250] bg-red-600 text-white px-12 py-6 rounded-[3rem] font-black flex items-center gap-6 animate-in slide-in-from-bottom-10 shadow-2xl">
          <span className="text-xs uppercase tracking-widest">{error}</span>
          <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg></button>
        </div>
      )}
    </div>
  );
};

export default App;
