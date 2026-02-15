
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { KEY_MAPPINGS } from '../constants';
import { PianoKey } from '../types';
import { audioService } from '../services/audioService';
import Key from './Key';

interface PianoProps {
  onNotePlayed?: (note: string) => void;
  highlightedNotes?: string[];
  octaveOffset: number;
}

const Piano: React.FC<PianoProps> = ({ onNotePlayed, highlightedNotes = [], octaveOffset }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const pressedKeysRef = useRef<Set<string>>(new Set());
  
  const octaveOffsetRef = useRef(octaveOffset);
  useEffect(() => {
    octaveOffsetRef.current = octaveOffset;
  }, [octaveOffset]);

  // Map by physical code (KeyD, KeyJ, etc) for maximum reliability
  const codeMap = useMemo(() => {
    const map: Record<string, PianoKey> = {};
    KEY_MAPPINGS.forEach(k => {
      map[k.keyboardCode] = k;
    });
    return map;
  }, []);

  const handleNoteStart = useCallback((key: PianoKey) => {
    if (!pressedKeysRef.current.has(key.keyboardCode)) {
      const shiftedFrequency = key.frequency * Math.pow(2, octaveOffsetRef.current);
      audioService.playNote(key.note, shiftedFrequency);
      
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(key.keyboardCode);
        return next;
      });
      pressedKeysRef.current.add(key.keyboardCode);
      if (onNotePlayed) onNotePlayed(key.note);
    }
  }, [onNotePlayed]);

  const handleNoteStop = useCallback((key: PianoKey) => {
    audioService.stopNote(key.note);
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(key.keyboardCode);
      return next;
    });
    pressedKeysRef.current.delete(key.keyboardCode);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const mapping = codeMap[e.code];
      if (mapping) {
        e.preventDefault();
        handleNoteStart(mapping);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const mapping = codeMap[e.code];
      if (mapping) {
        handleNoteStop(mapping);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [codeMap, handleNoteStart, handleNoteStop]);

  return (
    <div className="flex justify-center items-start p-8 bg-stone-900/50 rounded-xl border border-stone-800 shadow-2xl overflow-x-auto min-w-full">
      <div className="flex relative">
        {KEY_MAPPINGS.map((key) => {
          const basicNote = key.note.replace(/[0-9]/g, '');
          const isHighlighted = highlightedNotes.includes(basicNote) && key.octave >= 4;
          
          return (
            <Key
              key={key.note}
              keyData={key}
              isActive={activeKeys.has(key.keyboardCode)}
              isHighlighted={isHighlighted}
              onMouseDown={handleNoteStart}
              onMouseUp={handleNoteStop}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Piano;
