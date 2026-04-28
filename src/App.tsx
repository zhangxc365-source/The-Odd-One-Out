import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Heart, 
  Timer, 
  Gamepad2, 
  Info, 
  Users, 
  ChevronLeft, 
  Pause, 
  Play, 
  RefreshCw, 
  Home as HomeIcon,
  Search,
  CheckCircle2,
  XCircle,
  Zap,
  Sword,
  Target,
  Circle,
  Square
} from 'lucide-react';
import { GameMode, Difficulty, Language, CharacterPair, GameState, PKGameState } from './types';
import { UI_TRANSLATIONS, YCT_DATA } from './data/characters';
import HandwritingCanvas from './components/HandwritingCanvas';
import Button from './components/Button';
import Header from './components/Header';
import PKHeader from './components/PKHeader';
import PKMatrix from './components/PKMatrix';

export default function App() {
  const [state, setState] = useState<GameState & { targetMode?: GameMode, advancedResetCount: number }>({
    mode: 'HOME',
    level: 1,
    lesson: 1,
    score: 0,
    lives: 3,
    timeLeft: 30,
    phase: 'EASY',
    isPaused: false,
    language: 'en',
    advancedResetCount: 0
  });

  const [pkState, setPkState] = useState<PKGameState>({
    ...state,
    mode: 'PK',
    player1Score: 0,
    player2Score: 0,
    player1Lives: 3,
    player2Lives: 3,
    player1Combo: 0,
    player2Combo: 0,
    player1CooledDownUntil: 0,
    player2CooledDownUntil: 0,
    inkSmear1: false,
    inkSmear2: false,
    timeLeft: 90,
  });

  const [currentPair, setCurrentPair] = useState<CharacterPair | null>(null);
  const [activeSessionPair, setActiveSessionPair] = useState<CharacterPair | null>(null);
  const [matrix, setMatrix] = useState<string[]>([]);
  const [targetsFound, setTargetsFound] = useState<number[]>([]);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [itemCharges, setItemCharges] = useState(0);
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintedIndex, setHintedIndex] = useState<number | null>(null);
  const [hasEarnedItem, setHasEarnedItem] = useState(false);
  const [actualTarget, setActualTarget] = useState<string>('');
  const [actualDistractor, setActualDistractor] = useState<string>('');

  const t = UI_TRANSLATIONS[state.language] || UI_TRANSLATIONS.en;

  // --- Helpers for Handwriting Tool ---
  const handlePracticeClose = () => {
    setShowMagnifier(false);
    setItemCharges(1);
    setHasEarnedItem(true);
  };

  // --- Logic ---

  const getRandomizedPair = (pair: CharacterPair): CharacterPair => {
    const swap = Math.random() > 0.5;
    if (swap) {
      return {
        ...pair,
        target: pair.distractor,
        distractor: pair.target,
        pinyin: pair.distractorPinyin,
        distractorPinyin: pair.pinyin,
        translation: pair.distractorTranslation,
        distractorTranslation: pair.translation
      };
    }
    return pair;
  };

  const initMatrix = useCallback((pair: CharacterPair, difficulty: Difficulty) => {
    const size = difficulty === 'EASY' ? 4 : difficulty === 'MEDIUM' ? 6 : 8;
    const totalCells = size * size;
    // Restore level-specific target counts
    const targetCount = difficulty === 'EASY' ? 1 
      : difficulty === 'MEDIUM' ? Math.floor(Math.random() * 2) + 2 
      : Math.floor(Math.random() * 2) + 4; 
    
    let newMatrix = Array(totalCells).fill(pair.distractor);
    const availableIndices = Array.from({ length: totalCells }, (_, i) => i);
    const targetIndices: number[] = [];

    for (let i = 0; i < targetCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const picked = availableIndices.splice(randomIndex, 1)[0];
      targetIndices.push(picked);
      newMatrix[picked] = pair.target;
    }

    setMatrix(newMatrix);
    setActualTarget(pair.target);
    setActualDistractor(pair.distractor);
    setTargetsFound([]);
    return targetIndices.length;
  }, []);

  const startGameWithPair = (pair: CharacterPair, mode: GameMode = 'ROBOT') => {
    setCurrentPair(pair);
    const randomized = getRandomizedPair(pair);
    setActiveSessionPair(randomized);
    if (mode === 'PK') {
       setPkState(s => ({ 
         ...s, 
         mode: 'PK',
         player1Score: 0, 
         player2Score: 0, 
         player1Lives: 3,
         player2Lives: 3,
         lives: 3, 
         timeLeft: 90, 
         phase: 'HARD',
         player1CooledDownUntil: 0,
         player2CooledDownUntil: 0,
         inkSmear1: false,
         inkSmear2: false,
        }));
       setState(s => ({ ...s, mode: 'PREPARE', score: 0, targetMode: 'PK', advancedResetCount: 0 }));
    } else {
       setState(s => ({ ...s, mode: 'PREPARE', score: 0, lives: 3, timeLeft: 30, phase: 'EASY', targetMode: 'ROBOT', advancedResetCount: 0 }));
    }
  };

  const startGame = (level: number, lesson: number, mode: GameMode = 'ROBOT') => {
    const pair = YCT_DATA.find(l => l.id === level)?.lessons.find(ls => ls.id === lesson)?.pairs[0] || YCT_DATA[0].lessons[0].pairs[0];
    startGameWithPair(pair, mode);
  };

  const startActualPlay = () => {
    if (!activeSessionPair) return;
    
    setHintedIndex(null);
    setIsHintActive(false);

    if (state.targetMode === 'PK') {
       initMatrix(activeSessionPair, 'HARD');
       setState(s => ({ ...s, mode: 'PK', score: 0, advancedResetCount: 0 }));
       setPkState(ps => ({ 
         ...ps, 
         mode: 'PK',
         timeLeft: 90,
         player1Score: 0,
         player2Score: 0,
         player1Lives: 3,
         player2Lives: 3
       }));
    } else {
       initMatrix(activeSessionPair, 'EASY');
       setState(s => ({ ...s, mode: 'ROBOT', score: 0, timeLeft: 30, phase: 'EASY', advancedResetCount: 0, lives: 3 }));
       setItemCharges(0);
       setIsHintActive(false);
       setHasEarnedItem(false);
       setShowMagnifier(false);
       // Explicitly reset PK mode state to ensure no bleed
       setPkState(ps => ({ ...ps, mode: 'HOME' }));
    }
  };

  const handleCellClick = (index: number, player: 1 | 2 = 1) => {
    if (state.isPaused || state.lives <= 0) return;
    
     // PK Mode logic
    if (state.mode === 'PK') {
       const now = Date.now();
       if (player === 1 && (pkState.player1CooledDownUntil > now || pkState.player1Lives <= 0)) return;
       if (player === 2 && (pkState.player2CooledDownUntil > now || pkState.player2Lives <= 0)) return;

       if (matrix[index] === actualTarget) {
          if (targetsFound.includes(index)) return;
          const newFound = [...targetsFound, index];
          setTargetsFound(newFound);
          
          if (player === 1) {
            setPkState(s => ({ ...s, player1Score: s.player1Score + 10, inkSmear2: true }));
             // Reverted to longer smear duration (1500ms)
            setTimeout(() => setPkState(s => ({ ...s, inkSmear2: false })), 1500);
          } else {
            setPkState(s => ({ ...s, player2Score: s.player2Score + 10, inkSmear1: true }));
            setTimeout(() => setPkState(s => ({ ...s, inkSmear1: false })), 1500);
          }

          // Check if all targets found in PK mode
          const targetCountInMatrix = matrix.filter(c => c === actualTarget).length;
          if (newFound.length === targetCountInMatrix) {
              // Keep the same pair for the entire session
              initMatrix(activeSessionPair!, 'HARD');
          }
       } else {
          if (player === 1) {
            setPkState(s => ({ 
              ...s, 
              player1Score: Math.max(0, s.player1Score - 5), 
              player1CooledDownUntil: Date.now() + 1000,
              player1Lives: Math.max(0, s.player1Lives - 1)
            }));
          } else {
            setPkState(s => ({ 
              ...s, 
              player2Score: Math.max(0, s.player2Score - 5), 
              player2CooledDownUntil: Date.now() + 1000,
              player2Lives: Math.max(0, s.player2Lives - 1)
            }));
          }
       }
       return;
    }

    // Robot Mode logic
    if (matrix[index] === actualTarget) {
      if (targetsFound.includes(index)) return;
      
      const newFound = [...targetsFound, index];
      setTargetsFound(newFound);
      setState(s => ({ ...s, score: s.score + 10 }));
      
      const targetCountInMatrix = matrix.filter(c => c === actualTarget).length;
      if (newFound.length === targetCountInMatrix) {
        setHintedIndex(null);
        setIsHintActive(false);
        
        // Use activeSessionPair to keep it consistent through level changes
        if (state.phase === 'EASY') {
          setState(s => ({ ...s, phase: 'MEDIUM', timeLeft: 60 }));
          initMatrix(activeSessionPair!, 'MEDIUM');
        } else if (state.phase === 'MEDIUM') {
          setState(s => ({ ...s, phase: 'HARD', timeLeft: 120 }));
          initMatrix(activeSessionPair!, 'HARD');
        } else if (state.phase === 'HARD') {
          if (state.advancedResetCount === 0) {
            setState(s => ({ ...s, advancedResetCount: 1 }));
            initMatrix(activeSessionPair!, 'HARD');
          } else {
            setState(s => ({ ...s, mode: 'RESULT' }));
          }
        }
      }
    } else {
      setState(s => ({ ...s, score: Math.max(0, s.score - 5), lives: s.lives - 1 }));
      if (state.lives <= 1) {
        setState(s => ({ ...s, mode: 'RESULT' }));
      }
    }
  };

  // Timer Effect
  useEffect(() => {
    const mode = state.mode;
    if ((mode === 'ROBOT' || mode === 'PK') && !state.isPaused && !showMagnifier) {
      const timer = setInterval(() => {
        if (mode === 'ROBOT') {
          setState(s => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }));
        } else {
          setPkState(s => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.mode, state.isPaused, showMagnifier]);

  // PK Timer end
  useEffect(() => {
    if (state.mode === 'PK' && pkState.timeLeft === 0) {
      setState(s => ({ ...s, mode: 'RESULT', score: pkState.player1Score })); // Using P1 score for result display
    }
  }, [pkState.timeLeft, state.mode]);

  // PK Lives end
  useEffect(() => {
    if (state.mode === 'PK' && pkState.player1Lives === 0 && pkState.player2Lives === 0) {
      setState(s => ({ ...s, mode: 'RESULT' }));
    }
  }, [pkState.player1Lives, pkState.player2Lives, state.mode]);

  // Robot Timer end
  useEffect(() => {
    if (state.mode === 'ROBOT' && state.timeLeft === 0) {
      setState(s => ({ ...s, mode: 'RESULT' }));
    }
  }, [state.timeLeft, state.mode]);

  // --- Views ---

  if (state.mode === 'HOME') {
    return (
      <div className="min-h-screen bg-art-bg text-art-blue flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative border-8 border-art-amber">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-art-amber rounded-full opacity-10"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-art-emerald rounded-full opacity-10"></div>
        
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16 z-10"
        >
          <div className="flex justify-center mb-8 space-x-3">
             <button onClick={() => setState(s => ({ ...s, language: 'en' }))} className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${state.language==='en' ? 'bg-art-amber text-white border-art-amber-dark shadow-md' : 'bg-white/50 text-art-amber border-art-yellow-border hover:bg-white'}`}>EN</button>
             <button onClick={() => setState(s => ({ ...s, language: 'mn' }))} className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${state.language==='mn' ? 'bg-art-emerald text-white border-art-emerald-dark shadow-md' : 'bg-white/50 text-art-emerald border-art-yellow-border hover:bg-white'}`}>MN</button>
          </div>
          <h1 className="text-8xl font-black mb-4 tracking-tighter text-art-blue drop-shadow-sm font-serif">汉字找不同</h1>
          <p className="text-2xl font-black opacity-60 uppercase tracking-[0.2em] text-art-amber-dark">The Odd One Out</p>
        </motion.div>

        <div className="grid gap-6 w-full max-w-sm z-10">
          <Button onClick={() => setState(s => ({ ...s, mode: 'LEVEL_SELECT', targetMode: 'ROBOT' }))} className="text-2xl py-6">
            <Sword className="w-8 h-8" /> {t.robot}
          </Button>
          <Button variant="secondary" onClick={() => {
            setState(s => ({ ...s, mode: 'LEVEL_SELECT', targetMode: 'PK' }));
          }} className="text-2xl py-6">
            <Users className="w-8 h-8" /> {t.pk}
          </Button>
          <Button variant="ghost" onClick={() => setState(s => ({ ...s, mode: 'INTRO' }))} className="text-xl py-4">
            <Info className="w-6 h-6" /> {t.intro}
          </Button>
        </div>
      </div>
    );
  }

  if (state.mode === 'INTRO') {
    return (
      <div className="min-h-screen bg-art-bg text-art-blue flex flex-col items-center justify-center p-8 border-8 border-art-amber relative overflow-hidden">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        <div className="max-w-xl bg-white border-8 border-art-yellow-border p-12 rounded-[3.5rem] shadow-2xl relative z-10">
          <h2 className="text-5xl font-black mb-8 text-art-emerald font-serif italic text-center">{t.intro}</h2>
          
          <div className="space-y-8">
            <div className="bg-art-yellow-light/30 p-6 rounded-2xl border-l-8 border-art-amber italic">
              <h3 className="text-xs font-black uppercase text-art-amber-dark mb-1 tracking-widest leading-none">English</h3>
              <p className="text-lg leading-tight">{UI_TRANSLATIONS.en.rules}</p>
            </div>
            <div className="bg-art-emerald/10 p-6 rounded-2xl border-l-8 border-art-emerald italic">
               <h3 className="text-xs font-black uppercase text-art-emerald-dark mb-1 tracking-widest leading-none">Mongolian</h3>
              <p className="text-lg leading-tight">{UI_TRANSLATIONS.mn.rules}</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button onClick={() => setState(s => ({ ...s, mode: 'HOME' }))} className="w-full">
              {t.back}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.mode === 'LEVEL_SELECT') {
    const currentLevelData = YCT_DATA.find(lv => lv.id === state.level);
    const allPairs = currentLevelData?.lessons.flatMap(l => l.pairs) || [];
    const uniquePairs = allPairs.filter((pair, index, self) => 
      index === self.findIndex((p) => (p.target === pair.target && p.distractor === pair.distractor))
    );

    return (
      <div className="min-h-screen bg-art-bg flex flex-col md:flex-row p-6 md:p-12 gap-8 border-8 border-art-amber relative overflow-hidden">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        
        {/* Section 1: Level List (1x5 Vertical - reduced width) */}
        <div className="w-full md:w-1/4 flex flex-col items-center z-10 bg-white/40 backdrop-blur-sm p-6 rounded-[3rem] border-4 border-art-yellow-border self-stretch">
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <h2 className="text-5xl font-black mb-10 text-art-blue font-serif italic text-center underline decoration-art-amber decoration-8 underline-offset-8">LEVEL</h2>
            <div className="flex flex-col w-full gap-3">
              {YCT_DATA.map(lv => (
                <button 
                  key={lv.id}
                  onClick={() => setState(s => ({ ...s, level: lv.id }))}
                  className={`py-4 rounded-[1.5rem] font-black text-2xl transition-all border-4 flex items-center justify-center gap-4 ${state.level === lv.id ? 'bg-art-amber text-white border-art-amber-dark scale-105 z-10 shadow-xl' : 'bg-white text-art-blue border-art-yellow-border hover:bg-art-yellow-light'}`}
                >
                  YCT {lv.id}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 w-full">
            <Button variant="ghost" onClick={() => setState(s => ({ ...s, mode: 'HOME' }))} className="w-full text-xl py-4">
              <ChevronLeft className="w-6 h-6 mr-2" /> {t.back}
            </Button>
          </div>
        </div>

        {/* Section 2: Character Pairs Selection (increased width) */}
        <div className="w-full md:w-3/4 flex flex-col z-10 bg-white border-8 border-art-yellow-border p-8 rounded-[4rem] shadow-2xl relative self-stretch">
          <div className="flex justify-between items-center mb-10 pb-6 border-b-4 border-art-bg">
            <h2 className="text-5xl font-black text-art-emerald font-serif italic">{state.language === 'mn' ? 'Хятад ханз' : 'Chinese Character'}</h2>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                   const currentLevelData = YCT_DATA.find(lv => lv.id === state.level);
                   const allPairs = currentLevelData?.lessons.flatMap(l => l.pairs) || [];
                   const randomPair = allPairs[Math.floor(Math.random() * allPairs.length)];
                   if (randomPair) startGameWithPair(randomPair, state.targetMode);
                }}
                className="bg-art-amber text-white px-10 py-4 rounded-full font-black shadow-lg hover:bg-art-amber-dark transition-all flex items-center gap-4 transform hover:scale-105 active:scale-95"
              >
                 <Zap className="w-8 h-8 fill-white" />
                 <span className="text-xl uppercase tracking-widest">{t.random}</span>
              </button>
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-art-amber-dark uppercase tracking-tighter bg-white px-3 py-0.5 rounded-full border border-art-amber-dark/20 shadow-sm font-sans">Level Randomizer</span>
                 <span className="text-[8px] font-medium text-gray-400 italic">Play unknown pairs!</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-6 max-h-[65vh] scrollbar-thin scrollbar-thumb-art-amber p-2">
            {uniquePairs.map((pair, i) => (
              <button 
                key={i}
                onClick={() => startGameWithPair(pair, state.targetMode)}
                className="bg-white hover:bg-art-yellow-light/10 p-6 rounded-[2.5rem] border-4 border-art-yellow-border hover:border-art-emerald transition-all flex items-center justify-between group shadow-lg hover:shadow-2xl active:scale-95 gap-4"
              >
                {/* Left: Target */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[23px] font-black text-art-emerald-dark lowercase tracking-tight leading-none mb-1">{pair.pinyin.toLowerCase()}</div>
                  <div className="text-7xl font-serif text-black group-hover:scale-110 transition-transform mb-1">{pair.target}</div>
                  <div className="text-[21px] font-bold text-gray-500 truncate w-full text-center leading-none italic">
                    {state.language === 'mn' ? pair.translation.mn : pair.translation.en}
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center">
                   <div className="w-px h-8 bg-gray-100"></div>
                   <span className="text-xl font-black text-gray-300 my-1 italic">VS</span>
                   <div className="w-px h-8 bg-gray-100"></div>
                </div>

                {/* Right: Distractor */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[23px] font-black text-gray-500 lowercase tracking-tight leading-none mb-1">{pair.distractorPinyin.toLowerCase()}</div>
                  <div className="text-7xl font-serif text-gray-400 group-hover:scale-110 transition-transform mb-1">{pair.distractor}</div>
                  <div className="text-[21px] font-bold text-gray-400 truncate w-full text-center leading-none italic">
                    {state.language === 'mn' ? pair.distractorTranslation.mn : pair.distractorTranslation.en}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 text-center italic text-art-blue/40 text-sm font-medium">
             Select a specific character pair or choose Randomly to begin!
          </div>
        </div>
      </div>
    );
  }

  if (state.mode === 'PREPARE') {
    return (
      <div className="h-screen bg-art-bg text-art-blue flex flex-col items-center justify-between py-10 px-8 border-8 border-art-amber relative overflow-hidden">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        
        {/* Top Left Label */}
        <div className="absolute top-8 left-8">
           <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] leading-none mb-1">Chinese Character</div>
           <div className="text-4xl font-mono font-black text-art-blue">YCT{state.level}</div>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10 w-full max-w-5xl flex flex-col items-center flex-1 justify-center">
          <h2 className="text-6xl font-black mb-12 bg-white border-4 border-art-yellow-border px-16 py-6 rounded-full shadow-2xl font-serif italic inline-block leading-none">{t.prepare_title}</h2>
          
          <div className="flex items-center justify-center gap-8 md:gap-20 mb-12 px-4 w-full">
            {/* Left: Distractor (对比字) */}
            <div className="flex-1 flex flex-col items-center bg-white p-8 md:p-10 rounded-[3.5rem] border-4 border-art-yellow-border shadow-2xl transform -rotate-3 transition-all hover:rotate-0">
               <div className="text-[20px] font-black text-gray-400 lowercase mb-2 tracking-wide uppercase">{activeSessionPair?.distractorPinyin.toLowerCase()}</div>
               <div className="text-8xl md:text-[10rem] font-serif text-gray-700 relative leading-none">
                  {activeSessionPair?.distractor}
               </div>
               <div className="text-sm font-bold text-gray-400 italic mt-4">
                  {state.language === 'mn' ? activeSessionPair?.distractorTranslation.mn : activeSessionPair?.distractorTranslation.en}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest mt-4 text-gray-300 bg-gray-50 px-3 py-1 rounded-full">Distractor</span>
            </div>
            
            <div className="text-8xl text-art-emerald-dark font-black tracking-tighter drop-shadow-[6px_6px_0_rgba(16,185,129,0.3)] animate-pulse leading-none">VS</div>
            
            {/* Right: Target (目标字) with Emerald Glow/Border */}
            <div className="flex-1 flex flex-col items-center bg-white p-8 md:p-10 rounded-[3.5rem] border-4 border-art-emerald shadow-lg transform -rotate-1 relative group bg-art-yellow-light/10">
               <div className="text-[56px] font-black text-art-emerald-dark lowercase mb-6 tracking-tighter leading-none">{activeSessionPair?.pinyin.toLowerCase()}</div>
               <div className="text-8xl md:text-[12rem] font-serif text-art-blue font-black relative group leading-none">
                  <span className="relative z-10">{activeSessionPair?.target}</span>
                  <div className="absolute inset-0 bg-art-emerald/10 blur-3xl scale-125 group-hover:scale-150 transition-transform duration-1000"></div>
               </div>
               <div className="text-2xl font-black text-art-emerald italic mt-6">
                  {state.language === 'mn' ? activeSessionPair?.translation.mn : activeSessionPair?.translation.en}
               </div>
               <span className="text-[14px] font-black uppercase tracking-widest mt-6 text-art-emerald-dark bg-art-emerald/10 px-8 py-2 rounded-full">{t.prepare_desc}</span>
            </div>
          </div>
 
          <div className="bg-white border-4 border-art-amber px-10 py-6 rounded-3xl shadow-lg mb-20 max-w-2xl mx-auto border-dashed relative -translate-y-24">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black text-art-amber uppercase tracking-widest">Analysis</div>
            <p className="text-2xl font-black text-art-blue italic leading-tight text-center">
               {activeSessionPair?.difference}
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full max-w-2xl px-4 mt-4 -translate-y-24">
             <Button 
               onClick={startActualPlay} 
               className="text-6xl w-full py-12 bg-art-yellow text-art-blue border-art-yellow-border shadow-[8px_10px_0_rgba(255,221,0,0.4)] transform transition-all hover:-translate-y-2 font-black hover:shadow-[0_0_40px_rgba(255,221,0,0.6)] active:shadow-inner"
             >
               {t.start}
             </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (state.mode === 'PK') {
    const size = 8; // PK mode is always HARD 8x8
    const now = Date.now();
    
    return (
      <div className="min-h-screen bg-art-bg text-art-blue flex flex-col items-center overflow-hidden relative border-8 border-art-amber">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        <PKHeader 
          player1Score={pkState.player1Score}
          player2Score={pkState.player2Score}
          player1Lives={pkState.player1Lives}
          player2Lives={pkState.player2Lives}
          timeLeft={pkState.timeLeft}
          activeSessionPair={activeSessionPair}
          onPause={() => setState(s => ({ ...s, isPaused: true }))}
        />

        {/* PK Grid Layout */}
        <div className="flex-1 w-full flex flex-row overflow-hidden relative z-10 -translate-y-2">
           {/* Center Divider */}
           <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 z-10 hidden md:block"></div>

           {/* Player 1 View */}
           <div className="flex-1 flex flex-col items-center justify-center p-4 relative group">
              <div className={`
                transition-all duration-300
                ${pkState.player1CooledDownUntil > now ? 'brightness-50 grayscale' : ''}
              `}>
                <PKMatrix 
                  matrix={matrix} 
                  targetsFound={targetsFound} 
                  onCellClick={(i) => handleCellClick(i, 1)} 
                  player={1}
                />
              </div>
              <AnimatePresence>
                {pkState.inkSmear1 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
                  >
                    <div className="w-48 h-48 bg-black/80 rounded-full blur-2xl animate-ping" />
                    <div className="absolute w-32 h-32 bg-zinc-900 rounded-full blur-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
              {pkState.player1CooledDownUntil > now && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-red-600 px-6 py-2 rounded-full font-black text-xl animate-pulse">COOLING...</div>
                </div>
              )}
              <div className="mt-4 text-sm font-bold text-blue-400 uppercase tracking-widest">Player 1</div>
           </div>

           {/* Player 2 View */}
           <div className="flex-1 flex flex-col items-center justify-center p-4 relative group">
              <div className={`
                transition-all duration-300
                ${pkState.player2CooledDownUntil > now ? 'brightness-50 grayscale' : ''}
              `}>
                <PKMatrix 
                  matrix={matrix} 
                  targetsFound={targetsFound} 
                  onCellClick={(i) => handleCellClick(i, 2)} 
                  player={2}
                />
              </div>
              <AnimatePresence>
                {pkState.inkSmear2 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
                  >
                    <div className="w-48 h-48 bg-black/80 rounded-full blur-2xl animate-ping" />
                    <div className="absolute w-32 h-32 bg-zinc-900 rounded-full blur-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
              {pkState.player2CooledDownUntil > now && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-red-600 px-6 py-2 rounded-full font-black text-xl animate-pulse">COOLING...</div>
                </div>
              )}
              <div className="mt-4 text-sm font-bold text-red-400 uppercase tracking-widest">Player 2</div>
           </div>
        </div>

        {/* PK Matrix Viewport continues... */}
        
        {/* Pause Overlay (PK Mode) */}
        <AnimatePresence>
          {state.isPaused && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
            >
              <h2 className="text-6xl font-black mb-12 tracking-tighter text-white font-serif italic italic font-black">游戏暂停</h2>
              <div className="grid gap-6 w-full max-w-xs">
                <Button onClick={() => {
                  setState(s => ({ ...s, isPaused: false }));
                }} className="flex items-center justify-center gap-2 text-2xl py-6">
                  <Play /> 开始游戏 (Resume)
                </Button>
                <Button variant="secondary" onClick={() => {
                  startActualPlay();
                  setState(s => ({ ...s, isPaused: false }));
                }} className="flex items-center justify-center gap-2 text-2xl py-6">
                  <RefreshCw /> 重新开始 (Restart)
                </Button>
                <Button variant="ghost" onClick={() => setState(s => ({ ...s, mode: 'HOME', isPaused: false }))} className="flex items-center justify-center gap-2 text-2xl py-6 text-white border-white">
                  <HomeIcon /> 回到主页 (Home)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (state.mode === 'ROBOT') {
    const size = state.phase === 'EASY' ? 4 : state.phase === 'MEDIUM' ? 6 : 8;
    
    return (
      <div className="min-h-screen bg-art-bg text-art-blue flex flex-col items-center relative border-8 border-art-amber overflow-hidden">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        <Header 
          score={state.score} 
          lives={state.lives} 
          timeLeft={state.timeLeft} 
          target={activeSessionPair!} 
          onPause={() => setState(s => ({ ...s, isPaused: !s.isPaused }))}
          isPaused={state.isPaused}
          language={state.language}
        />

      <div className="flex-1 w-full bg-art-bg relative overflow-hidden flex items-center justify-center">
        {/* Background Decorations - Subtle icons instead of characters */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
           <Zap className="absolute top-[10%] left-[5%] w-32 h-32 rotate-12 text-art-amber" />
           <Target className="absolute top-[60%] right-[10%] w-48 h-48 -rotate-12 text-art-emerald" />
           <Trophy className="absolute bottom-[5%] left-[15%] w-24 h-24 text-art-blue" />
           <Circle className="absolute top-[20%] right-[25%] w-16 h-16 text-art-amber" />
           <Square className="absolute bottom-[40%] right-[5%] w-32 h-32 rotate-[45deg] text-art-yellow" />
           <Zap className="absolute top-[30%] right-[15%] w-20 h-20 -rotate-12 text-art-blue opacity-50" />
        </div>
        
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-art-amber rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-art-emerald rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

        {/* Props bar - Floating closer to center */}
        <div className="absolute top-1/2 left-44 -translate-y-1/2 flex flex-col items-center gap-6 z-40">
            <button 
              disabled={isHintActive}
              onClick={() => {
                if (itemCharges > 0) {
                  // Pick a random unclicked target index
                  const unclickedTargets = matrix
                    .map((char, idx) => ({ char, idx }))
                    .filter(item => item.char === actualTarget && !targetsFound.includes(item.idx));
                  
                  if (unclickedTargets.length > 0) {
                    const randomPick = unclickedTargets[Math.floor(Math.random() * unclickedTargets.length)];
                    setHintedIndex(randomPick.idx);
                    setIsHintActive(true);
                    setItemCharges(0);
                    // Short hint duration: 1.5s
                    setTimeout(() => {
                      setIsHintActive(false);
                      setHintedIndex(null);
                    }, 1500);
                  }
                } else if (!hasEarnedItem) {
                  setShowMagnifier(true); 
                }
              }}
              className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] font-black shadow-2xl border-4 transition-all ${isHintActive || (itemCharges === 0 && hasEarnedItem) ? 'bg-gray-200 border-gray-300 cursor-not-allowed text-gray-400' : 'bg-white border-art-amber text-art-amber-dark hover:scale-110 active:scale-95 hover:rotate-2'}`}
            >
              <Zap className={`w-12 h-12 ${itemCharges > 0 ? 'fill-art-amber animate-bounce' : ''}`} />
              <div className="flex flex-col items-center">
                <span className="text-2xl uppercase tracking-tighter">{itemCharges}/1</span>
                <span className="text-[10px] uppercase font-sans font-bold tracking-widest mt-1 opacity-60">
                   {itemCharges > 0 ? "Use Hint" : hasEarnedItem ? "No More" : "Earn"}
                </span>
              </div>
            </button>
            <div className="w-1 h-20 bg-gradient-to-b from-art-amber/30 to-transparent rounded-full shadow-sm"></div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center p-8 z-10 -translate-y-3">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={`${state.phase}-${state.advancedResetCount}-${actualTarget}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="grid gap-2 bg-art-yellow-light p-8 rounded-[3.5rem] border-8 border-art-yellow-border shadow-2xl backdrop-blur-sm"
              style={{ 
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                width: 'min(90vw, 680px)',
                height: 'min(90vw, 680px)',
                '--grid-size': size,
                '--grid-size-base': '340px'
              } as any}
            >
              {matrix.map((char, i) => (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  className={`
                    aspect-square flex items-center justify-center rounded-2xl md:rounded-3xl font-serif font-bold shadow-md
                    transition-[transform,background-color,border-color,box-shadow,ring] duration-300
                    ${targetsFound.includes(i) ? 'bg-art-emerald/10 text-art-emerald border-4 border-art-emerald scale-90' : 'bg-white border-4 border-art-yellow-border text-gray-800 hover:scale-105 active:scale-95'}
                    ${isHintActive && i === hintedIndex ? 'ring-8 ring-art-amber ring-offset-4 animate-pulse z-20' : ''}
                  `}
                  style={{ fontSize: 'calc(var(--grid-size-base) / (var(--grid-size) * 1.05))' } as any}
                  disabled={targetsFound.includes(i)}
                >
                  <span className="leading-none select-none">{char}</span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

        {/* Handwriting Practice Overlay */}
        <AnimatePresence>
          {showMagnifier && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
            >
              <div className="bg-white p-8 md:p-12 rounded-[4rem] border-8 border-art-yellow-border shadow-2xl w-full max-w-xl text-center">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-black italic text-art-emerald">Trace the character</h3>
                    <button 
                      onClick={() => setShowMagnifier(false)}
                      className="bg-red-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <XCircle />
                    </button>
                 </div>
                 
                 <HandwritingCanvas 
                   target={activeSessionPair?.target || ''} 
                   onClose={handlePracticeClose} 
                 />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Overlay */}
        <AnimatePresence>
          {state.isPaused && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
            >
              <h2 className="text-6xl font-black mb-12 tracking-tighter text-white font-serif italic italic font-black">游戏暂停</h2>
              <div className="grid gap-6 w-full max-w-xs">
                <Button onClick={() => {
                  setState(s => ({ ...s, isPaused: false }));
                  setPkState(s => ({ ...s, isPaused: false }));
                }} className="flex items-center justify-center gap-2 text-2xl py-6">
                  <Play /> 开始游戏 (Resume)
                </Button>
                <Button variant="secondary" onClick={() => {
                  startActualPlay();
                  setState(s => ({ ...s, isPaused: false }));
                }} className="flex items-center justify-center gap-2 text-2xl py-6">
                  <RefreshCw /> 重新开始 (Restart)
                </Button>
                <Button variant="ghost" onClick={() => setState(s => ({ ...s, mode: 'HOME', isPaused: false }))} className="flex items-center justify-center gap-2 text-2xl py-6 text-white border-white">
                  <HomeIcon /> 回到主页 (Home)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (state.mode === 'RESULT') {
    const isPK = state.targetMode === 'PK';
    const p1Score = isPK ? pkState.player1Score : state.score;
    const p2Score = isPK ? pkState.player2Score : 0;
    
    let resultTitle = "";
    if (isPK) {
       if (p1Score > p2Score) resultTitle = "P1 " + t.win;
       else if (p2Score > p1Score) resultTitle = "P2 " + t.win;
       else resultTitle = t.draw;
    } else {
       // Template 10: >80% (火眼金睛), 60-80% (超级明星), <60% (继续努力)
       // Max score estimation: Elementary (10), Medium (20-30), Advanced (40-50) * 2 reset = ~150-180
       // Let's use a simpler count based calculation
       const accuracy = state.score / 150 * 100; // Normalized estimate
       if (accuracy >= 80) resultTitle = t.result_perfect;
       else if (accuracy >= 60) resultTitle = t.result_good;
       else resultTitle = t.result_try_again;
    }
    
    return (
      <div className="min-h-screen bg-art-bg text-art-blue flex flex-col items-center justify-center p-6 border-8 border-art-amber relative overflow-hidden">
        <div className="absolute inset-0 art-dots opacity-10 pointer-events-none"></div>
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl text-center z-10"
        >
          <div className="mb-4">
             <h1 className="text-7xl font-black tracking-tighter font-serif italic text-art-blue shadow-white drop-shadow-md">{resultTitle}</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-[2.5rem] p-10 border-4 border-art-amber shadow-lg transform -rotate-1 relative group">
               <div className="absolute -top-2 -left-2 bg-art-amber text-white p-2 rounded-full shadow-md z-20"><Trophy className="w-5 h-5"/></div>
               <div className="text-[12px] opacity-40 uppercase font-black tracking-widest mb-2">{isPK ? 'Player 1' : t.score}</div>
               <div className="text-6xl font-mono font-black text-art-amber-dark">{p1Score.toString().padStart(3, '0')}</div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 border-4 border-art-emerald shadow-lg transform rotate-1 relative group">
               <div className="absolute -top-2 -right-2 bg-art-emerald text-white p-2 rounded-full shadow-md z-20"><CheckCircle2 className="w-5 h-5"/></div>
               <div className="text-[12px] opacity-40 uppercase font-black tracking-widest mb-2">{isPK ? 'Player 2' : 'Total Found' }</div>
               <div className="text-6xl font-mono font-black text-art-emerald-dark">{(isPK ? p2Score : state.score / 10).toString().padStart(isPK ? 3 : 2, '0')}</div>
            </div>
          </div>

          <div className="bg-art-yellow-light p-10 rounded-[3rem] border-4 border-dashed border-art-yellow-border mb-16 shadow-inner relative group overflow-hidden">
             <div className="absolute inset-0 art-dots opacity-5 pointer-events-none"></div>
             <div className="flex justify-center gap-12 items-center mb-6 relative z-10">
                {/* Left: Distractor */}
                <div className="flex flex-col items-center">
                   <span className="text-xl font-bold text-gray-600 lowercase">{activeSessionPair?.distractorPinyin.toLowerCase()}</span>
                   <span className="text-8xl text-art-amber-dark font-serif opacity-30">{activeSessionPair?.distractor}</span>
                   <span className="text-sm font-medium text-gray-500 italic">
                      {state.language === 'mn' ? activeSessionPair?.distractorTranslation.mn : activeSessionPair?.distractorTranslation.en}
                   </span>
                </div>

                <div className="flex flex-col items-center">
                   <div className="w-px h-12 bg-art-yellow-border"></div>
                   <span className="text-xl font-black text-art-blue/40 my-2 tracking-tighter">VS</span>
                   <div className="w-px h-12 bg-art-yellow-border"></div>
                </div>

                {/* Right: Target */}
                <div className="flex flex-col items-center">
                   <span className="text-xl font-black text-art-emerald-dark lowercase">{activeSessionPair?.pinyin.toLowerCase()}</span>
                   <span className="text-9xl text-art-emerald font-serif font-black">{activeSessionPair?.target}</span>
                   <span className="text-sm font-black text-art-emerald-dark italic">
                      {state.language === 'mn' ? activeSessionPair?.translation.mn : activeSessionPair?.translation.en}
                   </span>
                </div>
             </div>
             <div className="bg-white px-8 py-3 rounded-2xl border-2 border-art-yellow-border inline-block relative z-10">
                <p className="text-xl font-bold italic text-art-emerald-dark">"{activeSessionPair?.difference}"</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button variant="ghost" onClick={() => setState(s => ({ ...s, mode: 'HOME' }))}>
              <HomeIcon className="w-6 h-6" /> {t.home}
            </Button>
            <Button variant="secondary" onClick={() => startActualPlay()}>
              <RefreshCw className="w-6 h-6" /> {t.retry}
            </Button>
            <Button onClick={() => setState(s => ({ ...s, mode: 'LEVEL_SELECT' }))}>
              <Zap className="w-6 h-6" /> {t.next}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

