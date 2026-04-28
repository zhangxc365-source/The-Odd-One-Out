/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'ROBOT' | 'PK' | 'HOME' | 'INTRO' | 'LEVEL_SELECT' | 'PREPARE' | 'RESULT';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Language = 'zh' | 'en' | 'mn';

export interface CharacterPair {
  target: string;
  distractor: string;
  pinyin: string;
  distractorPinyin: string;
  translation: {
    en: string;
    mn: string;
  };
  distractorTranslation: {
    en: string;
    mn: string;
  };
  difference: string; // Description of the visual difference
}

export interface YctLevel {
  id: number;
  lessons: {
    id: number;
    pairs: CharacterPair[];
  }[];
}

export interface GameState {
  mode: GameMode;
  level: number;
  lesson: number;
  score: number;
  lives: number;
  timeLeft: number;
  phase: Difficulty;
  isPaused: boolean;
  language: Language;
}

export interface PKGameState extends GameState {
  player1Score: number;
  player2Score: number;
  player1Lives: number;
  player2Lives: number;
  player1Combo: number;
  player2Combo: number;
  player1CooledDownUntil: number;
  player2CooledDownUntil: number;
  inkSmear1: boolean;
  inkSmear2: boolean;
}
