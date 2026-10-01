import { Achievement, GameMode, GameStats } from '../types/game';

const STORAGE_KEY = 'ouroboros_snake_stats_v1';

export const INITIAL_STATS: GameStats = {
  highScores: {
    classic: 0,
    obstacles: 0,
    time_attack: 0,
    bot_battle: 0,
  },
  totalApples: 0,
  longestSnake: 0,
  gamesPlayed: 0,
  botWins: 0,
  highestCombo: 0,
  unlockedAchievements: [],
};

export const ACHIEVEMENTS_LIST: { id: string; title: string; description: string; iconName: string }[] = [
  {
    id: 'first_bite',
    title: 'First Nibble',
    description: 'Consume your very first fruit in any game mode.',
    iconName: 'Apple',
  },
  {
    id: 'length_30',
    title: 'Serpentine Stature',
    description: 'Grow your snake to a length of 30 segments.',
    iconName: 'Maximize2',
  },
  {
    id: 'length_60',
    title: 'Ouroboros Ascendant',
    description: 'Grow your snake to a colossal length of 60 segments.',
    iconName: 'Crown',
  },
  {
    id: 'golden_frenzy',
    title: 'Gilded Feast',
    description: 'Eat 5 golden multiplier apples.',
    iconName: 'Sparkles',
  },
  {
    id: 'combo_6',
    title: 'Fever Pitch',
    description: 'Achieve a 6x speed combo streak by eating apples within 3 seconds.',
    iconName: 'Zap',
  },
  {
    id: 'defeat_bot',
    title: 'Apex Predator',
    description: 'Outmaneuver and eliminate the AI Rival snake in Bot Battle.',
    iconName: 'Swords',
  },
  {
    id: 'teleport_hero',
    title: 'Quantum Phase',
    description: 'Travel through quantum wormholes in Obstacle mode.',
    iconName: 'Compass',
  },
  {
    id: 'time_attack_master',
    title: 'Against The Clock',
    description: 'Score 300 or higher in Time Attack mode.',
    iconName: 'Clock',
  },
  {
    id: 'veteran_eater',
    title: 'Centennial Feeder',
    description: 'Eat 100 total apples across all your sessions.',
    iconName: 'Trophy',
  },
];

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScores: {
        classic: parsed.highScores?.classic ?? 0,
        obstacles: parsed.highScores?.obstacles ?? 0,
        time_attack: parsed.highScores?.time_attack ?? 0,
        bot_battle: parsed.highScores?.bot_battle ?? 0,
      },
      totalApples: parsed.totalApples ?? 0,
      longestSnake: parsed.longestSnake ?? 0,
      gamesPlayed: parsed.gamesPlayed ?? 0,
      botWins: parsed.botWins ?? 0,
      highestCombo: parsed.highestCombo ?? 0,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
    };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore quota errors
  }
}

export function checkNewAchievements(
  currentStats: GameStats,
  runData: {
    mode: GameMode;
    score: number;
    length: number;
    applesInRun: number;
    goldenEaten: number;
    maxCombo: number;
    botDefeated: boolean;
    usedPortal: boolean;
  }
): { updatedStats: GameStats; newlyUnlocked: Achievement[] } {
  const unlocked = new Set<string>(currentStats.unlockedAchievements);
  const newlyUnlocked: Achievement[] = [];

  const check = (id: string) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      const def = ACHIEVEMENTS_LIST.find(a => a.id === id);
      if (def) {
        newlyUnlocked.push({ ...def, unlocked: true });
      }
    }
  };

  if (runData.applesInRun > 0 || currentStats.totalApples > 0) check('first_bite');
  if (runData.length >= 30 || currentStats.longestSnake >= 30) check('length_30');
  if (runData.length >= 60 || currentStats.longestSnake >= 60) check('length_60');
  if (runData.goldenEaten >= 5) check('golden_frenzy');
  if (runData.maxCombo >= 6 || currentStats.highestCombo >= 6) check('combo_6');
  if (runData.botDefeated) check('defeat_bot');
  if (runData.usedPortal) check('teleport_hero');
  if (runData.mode === 'time_attack' && runData.score >= 300) check('time_attack_master');
  if (currentStats.totalApples + runData.applesInRun >= 100) check('veteran_eater');

  const updatedStats: GameStats = {
    ...currentStats,
    totalApples: currentStats.totalApples + runData.applesInRun,
    longestSnake: Math.max(currentStats.longestSnake, runData.length),
    gamesPlayed: currentStats.gamesPlayed + 1,
    botWins: runData.botDefeated ? currentStats.botWins + 1 : currentStats.botWins,
    highestCombo: Math.max(currentStats.highestCombo, runData.maxCombo),
    highScores: {
      ...currentStats.highScores,
      [runData.mode]: Math.max(currentStats.highScores[runData.mode] || 0, runData.score),
    },
    unlockedAchievements: Array.from(unlocked),
  };

  saveGameStats(updatedStats);
  return { updatedStats, newlyUnlocked };
}
