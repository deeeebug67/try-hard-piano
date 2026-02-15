
import React, { useRef } from 'react';
import { PianoKey } from '../types';

interface KeyProps {
  keyData: PianoKey;
  isActive: boolean;
  isHighlighted: boolean;
  onMouseDown: (key: PianoKey) => void;
  onMouseUp: (key: PianoKey) => void;
}

const Key: React.FC<KeyProps> = ({ keyData, isActive, isHighlighted, onMouseDown, onMouseUp }) => {
  const isWhite = keyData.type === 'white';
  const isMouseDownOnThisKey = useRef(false);
  
  const handleMouseDown = () => {
    isMouseDownOnThisKey.current = true;
    onMouseDown(keyData);
  };

  const handleMouseUp = () => {
    if (isMouseDownOnThisKey.current) {
      isMouseDownOnThisKey.current = false;
      onMouseUp(keyData);
    }
  };

  const handleMouseLeave = () => {
    // Only stop if the mouse was actually responsible for starting this note
    // This prevents mouse movement from stopping notes played by the keyboard
    if (isMouseDownOnThisKey.current) {
      isMouseDownOnThisKey.current = false;
      onMouseUp(keyData);
    }
  };

  return (
    <div
      className={`
        relative select-none cursor-pointer transition-all duration-75
        ${isWhite 
          ? `w-12 h-64 border-x border-stone-300 rounded-b-md shadow-md z-10 
             ${isActive ? 'bg-amber-100 translate-y-1 shadow-inner' : isHighlighted ? 'bg-amber-50' : 'bg-stone-50 hover:bg-stone-100'}` 
          : `w-8 h-40 -mx-4 rounded-b-sm shadow-xl z-20 border-x border-black
             ${isActive ? 'bg-amber-900 translate-y-1 scale-95' : isHighlighted ? 'bg-amber-950' : 'bg-stone-900 hover:bg-stone-800'}`
        }
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Highlight glow for suggested chord notes */}
      {isHighlighted && !isActive && (
        <div className={`absolute inset-0 ${isWhite ? 'bg-amber-200/30' : 'bg-amber-400/20'} animate-pulse pointer-events-none`} />
      )}

      <div className={`
        absolute bottom-4 left-0 right-0 text-center pointer-events-none font-semibold text-[10px]
        ${isWhite ? 'text-stone-400' : 'text-stone-600'}
        ${isHighlighted ? 'text-amber-600 font-bold' : ''}
      `}>
        {keyData.keyboardKey.toUpperCase()}
      </div>
      <div className={`
        absolute bottom-10 left-0 right-0 text-center pointer-events-none font-bold text-[8px]
        ${isWhite ? 'text-stone-300' : 'text-stone-500'}
        ${isHighlighted ? 'text-amber-500' : ''}
      `}>
        {keyData.note}
      </div>
      
      {/* Glossy highlight for black keys */}
      {!isWhite && (
        <div className="absolute top-0 left-1 w-1 h-2/3 bg-white/5 rounded-full pointer-events-none" />
      )}
    </div>
  );
};

export default Key;
