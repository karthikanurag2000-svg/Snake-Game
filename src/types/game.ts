export type GameMode = 'classic' | 'obstacles' | 'time_attack' | 'bot_battle';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType = 'regular' | 'golden' | 'frost' | 'ghost' | 'magnet' | 'scissors';

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  type: FoodType;
  points: number;
  expiresAt?: number;
}

export interface Obstacle {
  x: number;
  y: number;
  type: 'wall' | 'portal';
  portalTarget?: Point;
  portalColor?: string;
}

export interface ActivePowerUp {
  type: FoodType;
  expiresAt: number;
  durationMs: number;
  name: string;
}

export type GameTheme = 'emerald' | 'cyberpunk' | 'solar' | 'synthwave' | 'gameboy';

export type SnakeSkin = 'glow' | 'pixel' | 'segmented' | 'cyber';

export type SpeedSetting = 'slow' | 'normal' | 'fast' | 'dynamic';

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameSettings {
  mode: GameMode;
  speed: SpeedSetting;
  gridSize: number;
  allowWallPass: boolean;
  theme: GameTheme;
  skin: SnakeSkin;
  soundEnabled: boolean;
  volume: number;
  showGridLines: boolean;
  haptics: boolean;
  virtualDpad: boolean;
}

export interface GameStats {
  highScores: Record<GameMode, number>;
  totalApples: number;
  longestSnake: number;
  gamesPlayed: number;
  botWins: number;
  highestCombo: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress?: { current: number; max: number };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}
