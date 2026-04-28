import React from 'react';
import { Timer, Play, Pause } from 'lucide-react';
import { CharacterPair, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/characters';

interface HeaderProps {
  score: number;
  lives: number;
  timeLeft: number;
  target: CharacterPair;
  onPause: () => void;
  isPaused: boolean;
  language: Language;
}

const Header: React.FC<HeaderProps> = ({ 
  score, 
  lives, 
  timeLeft, 
  target, 
  onPause, 
  isPaused,
  language 
}) => {
  return (
    <div className="w-full flex justify-between items-center p-6 bg-white/50 backdrop-blur-sm border-b-4 border-art-yellow-border sticky top-0 z-50">
      <div className="flex items-center gap-4 bg-white border-4 border-gray-800 p-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 pr-4 border-r-2 border-gray-100">
          <Timer className="w-6 h-6 text-art-amber-dark" />
          <span className="text-3xl font-black font-mono leading-none">{timeLeft}s</span>
        </div>
        <div className="flex gap-1 pl-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-2xl transition-all ${i < lives ? "grayscale-0" : "grayscale opacity-20"}`}>❤️</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center bg-white border-4 border-art-emerald px-12 py-3 rounded-[2rem] shadow-xl relative mb-2">
          <div className="text-6xl font-serif font-black text-black leading-none">
            {target.target}
          </div>
          <div className="flex gap-4 text-lg font-black text-art-emerald-dark uppercase mt-2">
            <span className="lowercase font-sans bg-art-emerald/5 px-2 rounded">{target.pinyin}</span>
            <span>{target.translation.en}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-art-blue text-white px-6 py-3 rounded-2xl text-lg font-black tracking-widest shadow-md border-b-4 border-blue-900">
           {score.toString().padStart(3, '0')}
        </div>
        <button 
          onClick={onPause} 
          className="w-16 h-16 bg-white border-4 border-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-50 shadow-[4px_4px_0_rgba(31,41,55,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          {isPaused ? <Play className="w-8 h-8 text-gray-800 fill-gray-800" /> : <Pause className="w-8 h-8 text-gray-800" />}
        </button>
      </div>
    </div>
  );
};

export default Header;
