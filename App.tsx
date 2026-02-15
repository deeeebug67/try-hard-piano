import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Piano from './components/Piano';
import { geminiService } from './services/geminiService';
import { audioService, PianoPreset } from './services/audioService';
import { History, Volume2, Wind, Search, Piano as PianoIcon, Layers, Music, AudioLines, Maximize, Minimize, Plus, Minus } from 'lucide-react';

const PRESETS: { id: PianoPreset, name: string, icon: React.ReactNode }[] = [
  { id: 'grand', name: 'Grand', icon: <PianoIcon className="w-4 h-4" /> },
  { id: 'synth', name: 'Synth', icon: <Layers className="w-4 h-4" /> },
  { id: 'string', name: 'String', icon: <Music className="w-4 h-4" /> },
  { id: 'violin', name: 'Violin', icon: <AudioLines className="w-4 h-4" /> },
  { id: 'honky-tonk', name: 'Honky', icon: <div className="w-4 h-4 font-bold text-[10px] leading-none">HT</div> },
];

const App: React.FC = () => {
  const [sessionNotes, setSessionNotes] = useState<string[]>([]);
  const [volume, setVolume] = useState(0.5);
  const [sustainValue, setSustainValue] = useState(4.0);
  const [chordInput, setChordInput] = useState("");
  const [chordNotes, setChordNotes] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<PianoPreset>('grand');
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleNotePlayed = useCallback((note: string) => {
    setSessionNotes(prev => [...prev.slice(-20), note]);
  }, []);

  const handleChordSearch = async () => {
    if (!chordInput) return;
    setIsAnalyzing(true);
    const notes = await geminiService.parseChord(chordInput);
    const normalizedNotes = notes.map(n => n.replace(/[0-9]/g, ''));
    setChordNotes(normalizedNotes);
    setIsAnalyzing(false);
  };

  const updateSustain = useCallback((val: number) => {
    setSustainValue(val);
    audioService.setSustain(val);
  }, []);

  const updateVolume = useCallback((val: number) => {
    setVolume(val);
    audioService.setVolume(val);
  }, []);

  const updatePreset = useCallback((preset: PianoPreset) => {
    setCurrentPreset(preset);
    audioService.setPreset(preset);
  }, []);

  const cyclePreset = useCallback(() => {
    setCurrentPreset(current => {
      const currentIndex = PRESETS.findIndex(p => p.id === current);
      const nextIndex = (currentIndex + 1) % PRESETS.length;
      const nextPreset = PRESETS[nextIndex].id;
      audioService.setPreset(nextPreset);
      return nextPreset;
    });
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const shiftOctave = useCallback((dir: 'up' | 'down') => {
    setOctaveOffset(prev => {
      const newVal = dir === 'up' ? prev + 1 : prev - 1;
      return Math.max(-2, Math.min(2, newVal)); // Limit to +/- 2 octaves
    });
  }, []);

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === '-') shiftOctave('down');
      if (e.key === '=') shiftOctave('up');
      if (e.code === 'Backquote') {
        e.preventDefault();
        cyclePreset();
      }
    };
    
    // Sync initial state to audio service
    audioService.setSustain(sustainValue);
    audioService.setVolume(volume);
    audioService.setPreset(currentPreset);

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [shiftOctave, cyclePreset, sustainValue, volume, currentPreset]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-amber-500 tracking-tighter">
              GRAND MAESTRO
            </h1>
            <p className="text-stone-500 uppercase tracking-widest text-xs mt-1">
              Professional Virtual Instrument
            </p>
          </div>
          <button 
            onClick={toggleFullScreen}
            className="p-3 bg-stone-900 border border-stone-800 rounded-full hover:bg-stone-800 transition-all text-stone-400 hover:text-amber-500"
            title="Toggle Full Screen"
          >
            {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 bg-stone-900/80 p-4 rounded-3xl border border-stone-800 shadow-xl">
          {/* Preset Selector */}
          <div className="flex bg-stone-950/50 p-1 rounded-2xl border border-stone-800/50">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => updatePreset(p.id)}
                title={`${p.name} (Press \` to cycle)`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-[10px] font-bold uppercase tracking-tight ${
                  currentPreset === p.id 
                    ? 'bg-amber-500 text-stone-950 shadow-lg' 
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {p.icon}
                <span className="hidden sm:inline">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:block h-8 w-px bg-stone-800" />

          {/* Octave Control */}
          <div className="flex items-center gap-3 bg-stone-950/50 px-3 py-2 rounded-2xl border border-stone-800/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-500 leading-none mb-1 text-center">Octave Shift</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => shiftOctave('down')}
                  className="p-1 hover:text-amber-500 transition-colors text-stone-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-4 text-center text-amber-500 font-bold">{octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}</span>
                <button 
                  onClick={() => shiftOctave('up')}
                  className="p-1 hover:text-amber-500 transition-colors text-stone-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Adjustable Sustain */}
          <div className="flex items-center gap-3 bg-stone-950/50 px-4 py-2 rounded-2xl border border-stone-800/50">
            <Wind className={`w-4 h-4 ${sustainValue > 2.0 ? 'text-amber-500' : 'text-stone-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-500 leading-none mb-1 text-center">Resonance</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0.1" 
                  max="4.0" 
                  step="0.1" 
                  value={sustainValue}
                  onChange={(e) => updateSustain(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] font-mono text-amber-500/80 w-6">{sustainValue.toFixed(1)}s</span>
              </div>
            </div>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-3 bg-stone-950/50 px-4 py-2 rounded-2xl border border-stone-800/50">
            <Volume2 className="w-4 h-4 text-stone-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-500 leading-none mb-1 text-center">Volume</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={(e) => updateVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-300"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Piano Area */}
      <main className="flex-1 flex flex-col justify-center gap-8 max-w-7xl mx-auto w-full">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-900/50 to-amber-700/50 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative">
             <Piano onNotePlayed={handleNotePlayed} highlightedNotes={chordNotes} octaveOffset={octaveOffset} />
          </div>
        </div>

        {/* Lower Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Chord Visualizer */}
          <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 backdrop-blur-sm transition-all hover:border-stone-700 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-stone-400 font-semibold uppercase text-xs tracking-wider">
              <Search className="w-4 h-4" />
              <span>Chord Visualizer</span>
            </div>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Type chord name... (e.g. Bmaj75b)" 
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-sm flex-1 focus:ring-1 focus:ring-amber-500 outline-none text-amber-50 transition-all placeholder:text-stone-600"
                value={chordInput}
                onChange={(e) => setChordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChordSearch()}
              />
              <button 
                onClick={handleChordSearch}
                disabled={!chordInput || isAnalyzing}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 active:scale-95 text-xs font-bold uppercase tracking-widest text-stone-950"
              >
                {isAnalyzing ? "..." : "SHOW"}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 italic mt-1">
              AI parses your input. Highlights appear automatically on the Lead Octave (C4-F5).
            </p>
            {chordNotes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-800 flex flex-wrap gap-2">
                {chordNotes.map((n, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-900/30 text-amber-500 rounded-full border border-amber-900/50 font-bold text-xs">
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-stone-400 font-semibold uppercase text-xs tracking-wider">
              <History className="w-4 h-4" />
              <span>Session History</span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[64px] content-start">
              {sessionNotes.length > 0 ? sessionNotes.map((n, i) => (
                <span key={i} className="px-2 py-0.5 bg-stone-800 text-stone-400 rounded text-[10px] font-mono border border-stone-700">
                  {n}
                </span>
              )) : (
                <p className="text-stone-600 italic text-xs">Your played notes will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Instructions */}
      <footer className="mt-8 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center text-xs text-stone-600 gap-4">
        <div className="flex gap-8 flex-wrap">
          <div className="transition-colors hover:text-stone-400">
            <span className="text-stone-500 font-bold block mb-1">BASS (C3-B3)</span>
            1-7 (White) | Z-B (Sharps)
          </div>
          <div className="transition-colors hover:text-stone-400">
            <span className="text-stone-500 font-bold block mb-1">LEAD (C4-F5)</span>
            A-' (White) | W-P (Sharps)
          </div>
          <div className="transition-colors hover:text-stone-400">
            <span className="text-stone-500 font-bold block mb-1">COMMANDS</span>
            - / = (Octave) | ` (Instrument)
          </div>
        </div>
        <div className="text-right italic">
          &copy; 2024 Grand Maestro. High-fidelity synthesis engine.
        </div>
      </footer>
    </div>
  );
};

export default App;