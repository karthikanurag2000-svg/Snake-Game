import { GameTheme } from '../types/game';

export interface ThemeColors {
  name: string;
  bgCanvas: string;
  gridLine: string;
  wallColor: string;
  wallGlow: string;
  playerHead: string;
  playerBodyGradStart: string;
  playerBodyGradEnd: string;
  playerEye: string;
  playerTongue: string;
  botHead: string;
  botBodyGradStart: string;
  botBodyGradEnd: string;
  appleColor: string;
  appleGlow: string;
  goldenColor: string;
  goldenGlow: string;
  frostColor: string;
  ghostColor: string;
  magnetColor: string;
  scissorsColor: string;
  accent: string;
}

export const THEMES: Record<GameTheme, ThemeColors> = {
  emerald: {
    name: 'Phosphor Arcade',
    bgCanvas: '#05130b',
    gridLine: 'rgba(16, 185, 129, 0.07)',
    wallColor: '#1e3a2b',
    wallGlow: '#10b981',
    playerHead: '#10b981',
    playerBodyGradStart: '#34d399',
    playerBodyGradEnd: '#065f46',
    playerEye: '#ffffff',
    playerTongue: '#f43f5e',
    botHead: '#f97316',
    botBodyGradStart: '#fb923c',
    botBodyGradEnd: '#9a3412',
    appleColor: '#ef4444',
    appleGlow: '#f87171',
    goldenColor: '#facc15',
    goldenGlow: '#fef08a',
    frostColor: '#38bdf8',
    ghostColor: '#c084fc',
    magnetColor: '#ec4899',
    scissorsColor: '#fb923c',
    accent: '#10b981',
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bgCanvas: '#0b0914',
    gridLine: 'rgba(147, 51, 234, 0.1)',
    wallColor: '#2b1b4f',
    wallGlow: '#a855f7',
    playerHead: '#06b6d4',
    playerBodyGradStart: '#22d3ee',
    playerBodyGradEnd: '#0e7490',
    playerEye: '#ffffff',
    playerTongue: '#f43f5e',
    botHead: '#f43f5e',
    botBodyGradStart: '#fb7185',
    botBodyGradEnd: '#be123c',
    appleColor: '#ec4899',
    appleGlow: '#f472b6',
    goldenColor: '#facc15',
    goldenGlow: '#fef08a',
    frostColor: '#38bdf8',
    ghostColor: '#c084fc',
    magnetColor: '#a855f7',
    scissorsColor: '#fb923c',
    accent: '#06b6d4',
  },
  solar: {
    name: 'Solar Terrarium',
    bgCanvas: '#140c06',
    gridLine: 'rgba(245, 158, 11, 0.08)',
    wallColor: '#3b2413',
    wallGlow: '#f59e0b',
    playerHead: '#f59e0b',
    playerBodyGradStart: '#fbbf24',
    playerBodyGradEnd: '#78350f',
    playerEye: '#ffffff',
    playerTongue: '#dc2626',
    botHead: '#06b6d4',
    botBodyGradStart: '#38bdf8',
    botBodyGradEnd: '#0369a1',
    appleColor: '#ea580c',
    appleGlow: '#fb923c',
    goldenColor: '#facc15',
    goldenGlow: '#fde047',
    frostColor: '#67e8f9',
    ghostColor: '#d8b4fe',
    magnetColor: '#f43f5e',
    scissorsColor: '#f59e0b',
    accent: '#f59e0b',
  },
  synthwave: {
    name: 'Synthwave 84',
    bgCanvas: '#0e0719',
    gridLine: 'rgba(236, 72, 153, 0.12)',
    wallColor: '#36113f',
    wallGlow: '#ec4899',
    playerHead: '#ec4899',
    playerBodyGradStart: '#f472b6',
    playerBodyGradEnd: '#831843',
    playerEye: '#ffffff',
    playerTongue: '#06b6d4',
    botHead: '#10b981',
    botBodyGradStart: '#34d399',
    botBodyGradEnd: '#064e3b',
    appleColor: '#06b6d4',
    appleGlow: '#67e8f9',
    goldenColor: '#facc15',
    goldenGlow: '#fef08a',
    frostColor: '#a5f3fc',
    ghostColor: '#c084fc',
    magnetColor: '#f43f5e',
    scissorsColor: '#f59e0b',
    accent: '#ec4899',
  },
  gameboy: {
    name: 'GameBoy Classic',
    bgCanvas: '#8b956d',
    gridLine: 'rgba(43, 62, 34, 0.15)',
    wallColor: '#1f2e1a',
    wallGlow: '#49603e',
    playerHead: '#1f2e1a',
    playerBodyGradStart: '#2b3e22',
    playerBodyGradEnd: '#3f5333',
    playerEye: '#c4cfa1',
    playerTongue: '#1f2e1a',
    botHead: '#49603e',
    botBodyGradStart: '#617a53',
    botBodyGradEnd: '#7a9668',
    appleColor: '#1f2e1a',
    appleGlow: '#2b3e22',
    goldenColor: '#3f5333',
    goldenGlow: '#617a53',
    frostColor: '#49603e',
    ghostColor: '#7a9668',
    magnetColor: '#1f2e1a',
    scissorsColor: '#3f5333',
    accent: '#2b3e22',
  },
};
