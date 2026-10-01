import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivePowerUp,
  Direction,
  GameMode,
  GameSettings,
  GameStats,
  GameStatus,
  Achievement,
} from './types/game';
import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { GameBoard } from './components/GameBoard';
import { ArcadeControls } from './components/ArcadeControls';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { checkNewAchievements, loadGameStats, saveGameStats } from './utils/storage';
import { sound } from './utils/audio';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  speed: 'normal',
  gridSize: 22,
  allowWallPass: false,
  theme: 'emerald',
  skin: 'glow',
  soundEnabled: true,
  volume: 0.5,
  showGridLines: true,
  haptics: true,
  virtualDpad: true,
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('ouroboros_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<GameStats>(() => loadGameStats());
  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');

  // Active game run telemetry
  const [score, setScore] = useState<number>(0);
  const [length, setLength] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [comboProgress, setComboProgress] = useState<number>(0);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [botScore, setBotScore] = useState<number>(0);
  const [botLength, setBotLength] = useState<number>(3);

  // Modals
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // GameOver run results
  const [lastRunResults, setLastRunResults] = useState<{
    score: number;
    length: number;
    applesInRun: number;
    maxCombo: number;
    survivalSeconds: number;
    isNewHigh: boolean;
    botDefeated: boolean;
    newAchievements: Achievement[];
  } | null>(null);

  // Direction handler ref from GameBoard
  const directionHandlerRef = useRef<((dir: Direction) => void) | null>(null);

  // Save settings when modified
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('ouroboros_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectMode = (newMode: GameMode) => {
    if (gameStatus === 'PLAYING') return;
    handleUpdateSettings({ mode: newMode });
    setGameStatus('MENU');
    setScore(0);
    setLength(3);
    setCombo(1);
    setActivePowerUps([]);
  };

  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    handleUpdateSettings({ soundEnabled: nextState });
    sound.setMuted(!nextState);
  };

  const handleStartOrResume = useCallback(() => {
    setGameStatus(prev => {
      if (prev === 'MENU' || prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameStatus(prev => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setIsGameOverModalOpen(false);
    setGameStatus('PLAYING');
    setScore(0);
    setLength(3);
    setCombo(1);
    setComboProgress(0);
    setActivePowerUps([]);
    setTimeLeft(90);
  }, []);

  const handleScoreUpdate = useCallback((s: number, l: number) => {
    setScore(prev => (prev !== s ? s : prev));
    setLength(prev => (prev !== l ? l : prev));
  }, []);

  const handleComboUpdate = useCallback((c: number, p: number) => {
    setCombo(prev => (prev !== c ? c : prev));
    setComboProgress(prev => (Math.abs(prev - p) > 0.04 ? p : prev));
  }, []);

  const handlePowerUpsUpdate = useCallback((ups: ActivePowerUp[]) => {
    setActivePowerUps(ups);
  }, []);

  const handleTimeUpdate = useCallback((t: number) => {
    setTimeLeft(prev => (Math.floor(prev) !== Math.floor(t) ? t : prev));
  }, []);

  const handleBotUpdate = useCallback((bs: number, bl: number) => {
    setBotScore(prev => (prev !== bs ? bs : prev));
    setBotLength(prev => (prev !== bl ? bl : prev));
  }, []);

  const handleDirectionRef = useCallback((fn: (dir: Direction) => void) => {
    directionHandlerRef.current = fn;
  }, []);

  const handleDirectionChange = useCallback((dir: Direction) => {
    if (directionHandlerRef.current) {
      directionHandlerRef.current(dir);
    }
  }, []);

  // Keyboard shortcut listeners (Space, R, M, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStatus === 'MENU') {
          handleStartOrResume();
        } else if (gameStatus === 'PLAYING' || gameStatus === 'PAUSED') {
          handleTogglePause();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (!isSettingsOpen && !isStatsOpen && !isHelpOpen) {
          e.preventDefault();
          handleRestart();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsStatsOpen(false);
        setIsHelpOpen(false);
        if (gameStatus === 'PLAYING') {
          setGameStatus('PAUSED');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, isSettingsOpen, isStatsOpen, isHelpOpen, settings.soundEnabled]);

  const handleGameOver = useCallback(
    (runData: {
      score: number;
      length: number;
      applesInRun: number;
      goldenEaten: number;
      maxCombo: number;
      survivalSeconds: number;
      botDefeated: boolean;
      usedPortal: boolean;
    }) => {
      setGameStatus('GAME_OVER');

      const currentHighScore = stats.highScores[settings.mode] || 0;
      const isNewHigh = runData.score > currentHighScore;

      const { updatedStats, newlyUnlocked } = checkNewAchievements(stats, {
        mode: settings.mode,
        score: runData.score,
        length: runData.length,
        applesInRun: runData.applesInRun,
        goldenEaten: runData.goldenEaten,
        maxCombo: runData.maxCombo,
        botDefeated: runData.botDefeated,
        usedPortal: runData.usedPortal,
      });

      setStats(updatedStats);

      setLastRunResults({
        score: runData.score,
        length: runData.length,
        applesInRun: runData.applesInRun,
        maxCombo: runData.maxCombo,
        survivalSeconds: runData.survivalSeconds,
        isNewHigh,
        botDefeated: runData.botDefeated,
        newAchievements: newlyUnlocked,
      });

      setIsGameOverModalOpen(true);
    },
    [settings.mode, stats]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* 3-Zone Header Contract */}
      <Header
        currentMode={settings.mode}
        onSelectMode={handleSelectMode}
        gameStatus={gameStatus}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Arena Content Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center justify-between gap-4">
        {/* HUD Area */}
        <div className="w-full max-w-[540px]">
          <HUD
            score={score}
            highScore={stats.highScores[settings.mode] || 0}
            length={length}
            combo={combo}
            comboTimerProgress={comboProgress}
            timeLeft={settings.mode === 'time_attack' ? timeLeft : undefined}
            activePowerUps={activePowerUps}
            mode={settings.mode}
            botScore={settings.mode === 'bot_battle' ? botScore : undefined}
            botLength={settings.mode === 'bot_battle' ? botLength : undefined}
          />
        </div>

        {/* Central Game Board Canvas */}
        <div className="w-full flex justify-center items-center">
          <GameBoard
            settings={settings}
            gameStatus={gameStatus}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onComboUpdate={handleComboUpdate}
            onPowerUpsUpdate={handlePowerUpsUpdate}
            onTimeUpdate={handleTimeUpdate}
            onBotUpdate={handleBotUpdate}
            onDirectionRef={handleDirectionRef}
            onRequestResume={handleStartOrResume}
          />
        </div>

        {/* Virtual On-screen D-Pad Controls */}
        {settings.virtualDpad && (
          <div className="w-full max-w-[540px]">
            <ArcadeControls
              onDirectionChange={handleDirectionChange}
              currentDirection="RIGHT"
              gameStatus={gameStatus}
              onTogglePause={handleTogglePause}
              onRestart={handleRestart}
            />
          </div>
        )}

        {/* Desktop Quick Shortcuts Bar */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400 py-1 font-mono">
          <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">WASD / Arrows</kbd> Move</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">Space</kbd> Pause/Resume</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">R</kbd> Restart</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">M</kbd> Audio</span>
        </div>
      </main>

      {/* Modals */}
      {isGameOverModalOpen && lastRunResults && (
        <GameOverModal
          score={lastRunResults.score}
          highScore={stats.highScores[settings.mode] || 0}
          isNewHigh={lastRunResults.isNewHigh}
          mode={settings.mode}
          length={lastRunResults.length}
          applesEaten={lastRunResults.applesInRun}
          maxCombo={lastRunResults.maxCombo}
          survivalSeconds={lastRunResults.survivalSeconds}
          botDefeated={lastRunResults.botDefeated}
          newAchievements={lastRunResults.newAchievements}
          onPlayAgain={handleRestart}
          onChangeMode={() => {
            setIsGameOverModalOpen(false);
            setGameStatus('MENU');
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isStatsOpen && (
        <StatsModal
          stats={stats}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {isHelpOpen && (
        <HowToPlayModal
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </div>
  );
}
