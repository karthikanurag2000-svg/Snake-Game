import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  ActivePowerUp,
  Direction,
  FoodItem,
  FoodType,
  GameMode,
  GameSettings,
  GameStatus,
  Obstacle,
  Particle,
  Point,
} from '../types/game';
import { THEMES } from '../utils/theme';
import { sound } from '../utils/audio';
import { getLevelObstacles } from '../utils/levels';
import { getBotNextDirection } from '../utils/aiBot';

interface GameBoardProps {
  settings: GameSettings;
  gameStatus: GameStatus;
  onGameOver: (runData: {
    score: number;
    length: number;
    applesInRun: number;
    goldenEaten: number;
    maxCombo: number;
    survivalSeconds: number;
    botDefeated: boolean;
    usedPortal: boolean;
  }) => void;
  onScoreUpdate: (score: number, length: number) => void;
  onComboUpdate: (combo: number, progress: number) => void;
  onPowerUpsUpdate: (powerUps: ActivePowerUp[]) => void;
  onTimeUpdate: (timeLeft: number) => void;
  onBotUpdate: (score: number, length: number) => void;
  onDirectionRef?: (changeDir: (dir: Direction) => void) => void;
  onRequestResume?: () => void;
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const GameBoard: React.FC<GameBoardProps> = ({
  settings,
  gameStatus,
  onGameOver,
  onScoreUpdate,
  onComboUpdate,
  onPowerUpsUpdate,
  onTimeUpdate,
  onBotUpdate,
  onDirectionRef,
  onRequestResume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Refs (using refs for high-frequency game loop synchronization)
  const gridSize = settings.gridSize || 24;
  const playerSnakeRef = useRef<Point[]>([
    { x: 10, y: 12 },
    { x: 9, y: 12 },
    { x: 8, y: 12 },
  ]);
  const currentDirectionRef = useRef<Direction>('RIGHT');
  const inputQueueRef = useRef<Direction[]>([]);

  // AI Bot state
  const botSnakeRef = useRef<Point[]>([
    { x: 18, y: 4 },
    { x: 19, y: 4 },
    { x: 20, y: 4 },
  ]);
  const botDirectionRef = useRef<Direction>('LEFT');
  const botScoreRef = useRef<number>(0);
  const botDefeatedRef = useRef<boolean>(false);

  // Foods, Obstacles, Particles
  const foodItemsRef = useRef<FoodItem[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUp[]>([]);

  // Scoring and Stats
  const scoreRef = useRef<number>(0);
  const applesEatenRef = useRef<number>(0);
  const goldenEatenRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const comboExpireTimerRef = useRef<number>(0);
  const maxComboRef = useRef<number>(1);
  const startTimeRef = useRef<number>(Date.now());
  const usedPortalRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(90); // for time_attack

  // Animation timing
  const lastTickTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);
  const tongueTimerRef = useRef<number>(0);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Stable callbacks ref to prevent re-render loops
  const callbacksRef = useRef({
    onGameOver,
    onScoreUpdate,
    onComboUpdate,
    onPowerUpsUpdate,
    onTimeUpdate,
    onBotUpdate,
    onRequestResume,
  });

  useEffect(() => {
    callbacksRef.current = {
      onGameOver,
      onScoreUpdate,
      onComboUpdate,
      onPowerUpsUpdate,
      onTimeUpdate,
      onBotUpdate,
      onRequestResume,
    };
  });

  // Audio setup
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  // Compute speed in ms
  const getTickSpeed = useCallback(() => {
    let base = 100;
    switch (settings.speed) {
      case 'slow':
        base = 150;
        break;
      case 'normal':
        base = 100;
        break;
      case 'fast':
        base = 65;
        break;
      case 'dynamic':
        base = Math.max(45, 120 - Math.floor(applesEatenRef.current / 4) * 5);
        break;
    }

    // Check Frost power-up
    const hasFrost = activePowerUpsRef.current.some(p => p.type === 'frost' && p.expiresAt > Date.now());
    if (hasFrost) {
      base = Math.floor(base * 1.55);
    }

    return base;
  }, [settings.speed]);

  // Spawn particle helper
  const addParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: (x + 0.5) * (canvasRef.current ? canvasRef.current.width / (gridSize * (window.devicePixelRatio || 1)) : 20),
        y: (y + 0.5) * (canvasRef.current ? canvasRef.current.height / (gridSize * (window.devicePixelRatio || 1)) : 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 20 + 20,
      });
    }
  };

  // Find free coordinate on grid
  const getRandomFreeCell = useCallback((): Point => {
    const occupied = new Set<string>();
    playerSnakeRef.current.forEach(p => occupied.add(`${p.x},${p.y}`));
    if (settings.mode === 'bot_battle') {
      botSnakeRef.current.forEach(p => occupied.add(`${p.x},${p.y}`));
    }
    obstaclesRef.current.forEach(o => occupied.add(`${o.x},${o.y}`));
    foodItemsRef.current.forEach(f => occupied.add(`${f.x},${f.y}`));

    let attempts = 0;
    while (attempts < 200) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (!occupied.has(`${x},${y}`)) {
        return { x, y };
      }
      attempts++;
    }
    return { x: 1, y: 1 };
  }, [gridSize, settings.mode]);

  // Spawn food helper
  const spawnFood = useCallback((forcedType?: FoodType) => {
    const pt = getRandomFreeCell();
    let type: FoodType = forcedType || 'regular';

    if (!forcedType) {
      const rand = Math.random();
      if (rand < 0.12) {
        type = 'golden';
      } else if (rand < 0.18) {
        type = 'frost';
      } else if (rand < 0.24) {
        type = 'ghost';
      } else if (rand < 0.28) {
        type = 'magnet';
      } else if (rand < 0.32 && playerSnakeRef.current.length > 15) {
        type = 'scissors';
      }
    }

    const points = type === 'golden' ? 50 : type === 'regular' ? 10 : 25;
    const expiresAt = type !== 'regular' ? Date.now() + 14000 : undefined;

    foodItemsRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      x: pt.x,
      y: pt.y,
      type,
      points,
      expiresAt,
    });
  }, [getRandomFreeCell]);

  // Initialize Game State for current mode
  const initGame = useCallback(() => {
    const mid = Math.floor(gridSize / 2);
    playerSnakeRef.current = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    currentDirectionRef.current = 'RIGHT';
    inputQueueRef.current = [];

    // Reset bot
    botSnakeRef.current = [
      { x: Math.max(2, gridSize - 4), y: 3 },
      { x: Math.max(3, gridSize - 3), y: 3 },
      { x: Math.max(4, gridSize - 2), y: 3 },
    ];
    botDirectionRef.current = 'LEFT';
    botScoreRef.current = 0;
    botDefeatedRef.current = false;

    // Reset counters
    scoreRef.current = 0;
    applesEatenRef.current = 0;
    goldenEatenRef.current = 0;
    comboRef.current = 1;
    comboExpireTimerRef.current = 0;
    maxComboRef.current = 1;
    startTimeRef.current = Date.now();
    usedPortalRef.current = false;
    timeLeftRef.current = 90;
    particlesRef.current = [];
    activePowerUpsRef.current = [];

    // Load obstacles for mode
    if (settings.mode === 'obstacles') {
      obstaclesRef.current = getLevelObstacles(0, gridSize);
    } else {
      obstaclesRef.current = [];
    }

    // Spawn initial foods
    foodItemsRef.current = [];
    spawnFood('regular');
    spawnFood('regular');
    if (settings.mode === 'time_attack') {
      spawnFood('golden');
    }

    // Notify parent
    callbacksRef.current.onScoreUpdate(0, playerSnakeRef.current.length);
    callbacksRef.current.onComboUpdate(1, 0);
    callbacksRef.current.onPowerUpsUpdate([]);
    callbacksRef.current.onTimeUpdate(timeLeftRef.current);
    if (settings.mode === 'bot_battle') {
      callbacksRef.current.onBotUpdate(0, botSnakeRef.current.length);
    }
  }, [gridSize, settings.mode, spawnFood]);

  // Expose direction change callback to parent (for D-Pad and Keyboard)
  const handleDirectionInput = useCallback((newDir: Direction) => {
    if (gameStatus === 'PAUSED' && callbacksRef.current.onRequestResume) {
      callbacksRef.current.onRequestResume();
    }
    if (gameStatus !== 'PLAYING') return;

    const lastPlanned = inputQueueRef.current.length > 0
      ? inputQueueRef.current[inputQueueRef.current.length - 1]
      : currentDirectionRef.current;

    // Don't queue 180° instant turn into yourself
    if (newDir !== lastPlanned && newDir !== OPPOSITE_DIRECTIONS[lastPlanned]) {
      if (inputQueueRef.current.length < 2) {
        inputQueueRef.current.push(newDir);
      }
    }
  }, [gameStatus]);

  useEffect(() => {
    if (onDirectionRef) {
      onDirectionRef(handleDirectionInput);
    }
  }, [onDirectionRef, handleDirectionInput]);

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let targetDir: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetDir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetDir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetDir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetDir = 'RIGHT';
          break;
      }

      if (targetDir) {
        e.preventDefault();
        handleDirectionInput(targetDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionInput]);

  // Start or reset on status change
  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      if (scoreRef.current === 0 && applesEatenRef.current === 0) {
        initGame();
      }
    } else if (gameStatus === 'MENU') {
      initGame();
    }
  }, [gameStatus, initGame]);

  // Game End trigger
  const triggerGameOver = useCallback(() => {
    sound.playDie();
    const head = playerSnakeRef.current[0] || { x: 10, y: 10 };
    addParticles(head.x, head.y, '#ef4444', 30);

    const survivalSeconds = (Date.now() - startTimeRef.current) / 1000;
    callbacksRef.current.onGameOver({
      score: scoreRef.current,
      length: playerSnakeRef.current.length,
      applesInRun: applesEatenRef.current,
      goldenEaten: goldenEatenRef.current,
      maxCombo: maxComboRef.current,
      survivalSeconds,
      botDefeated: botDefeatedRef.current,
      usedPortal: usedPortalRef.current,
    });
  }, []);

  // Magnet effect logic: pull foods within 5 tiles towards head
  const applyMagnetEffect = (head: Point) => {
    foodItemsRef.current.forEach(food => {
      const dx = head.x - food.x;
      const dy = head.y - food.y;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist <= 6 && dist > 1) {
        if (Math.random() < 0.6) {
          if (Math.abs(dx) > Math.abs(dy)) {
            food.x += Math.sign(dx);
          } else {
            food.y += Math.sign(dy);
          }
        }
      }
    });
  };

  // Main Game Physics Step
  const stepGame = useCallback(() => {
    if (gameStatus !== 'PLAYING') return;

    // Time attack countdown
    if (settings.mode === 'time_attack') {
      timeLeftRef.current -= getTickSpeed() / 1000;
      callbacksRef.current.onTimeUpdate(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0;
        triggerGameOver();
        return;
      }
    }

    // Clean expired power-ups and foods
    const now = Date.now();
    activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.expiresAt > now);
    callbacksRef.current.onPowerUpsUpdate([...activePowerUpsRef.current]);

    foodItemsRef.current = foodItemsRef.current.filter(f => !f.expiresAt || f.expiresAt > now);
    while (foodItemsRef.current.length < (settings.mode === 'time_attack' ? 3 : 2)) {
      spawnFood();
    }

    // Update Combo timer
    if (comboRef.current > 1) {
      const remainingComboTime = comboExpireTimerRef.current - now;
      if (remainingComboTime <= 0) {
        comboRef.current = 1;
        callbacksRef.current.onComboUpdate(1, 0);
      } else {
        callbacksRef.current.onComboUpdate(comboRef.current, remainingComboTime / 3500);
      }
    }

    // Dequeue next direction input
    if (inputQueueRef.current.length > 0) {
      currentDirectionRef.current = inputQueueRef.current.shift()!;
    }
    const dir = currentDirectionRef.current;
    const vector = DIRECTION_VECTORS[dir];

    const currentHead = playerSnakeRef.current[0];
    let nextX = currentHead.x + vector.x;
    let nextY = currentHead.y + vector.y;

    // Wall collision / wrap-around
    if (settings.allowWallPass) {
      nextX = (nextX + gridSize) % gridSize;
      nextY = (nextY + gridSize) % gridSize;
    } else {
      if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
        triggerGameOver();
        return;
      }
    }

    // Portal check
    const portalHit = obstaclesRef.current.find(
      o => o.type === 'portal' && o.x === nextX && o.y === nextY
    );
    if (portalHit && portalHit.portalTarget) {
      nextX = portalHit.portalTarget.x;
      nextY = portalHit.portalTarget.y;
      usedPortalRef.current = true;
      sound.playTeleport();
      addParticles(nextX, nextY, portalHit.portalColor || '#06b6d4', 16);
    }

    // Solid wall obstacle collision
    const isGhostActive = activePowerUpsRef.current.some(p => p.type === 'ghost');
    const wallHit = obstaclesRef.current.find(
      o => o.type === 'wall' && o.x === nextX && o.y === nextY
    );
    if (wallHit && !isGhostActive) {
      triggerGameOver();
      return;
    }

    // Self-tail collision check
    const tailCollision = playerSnakeRef.current.slice(0, -1).some(
      segment => segment.x === nextX && segment.y === nextY
    );
    if (tailCollision && !isGhostActive) {
      triggerGameOver();
      return;
    }

    // Check collision with AI Bot in bot battle
    if (settings.mode === 'bot_battle') {
      const botBody = botSnakeRef.current;
      const botHit = botBody.some(segment => segment.x === nextX && segment.y === nextY);
      if (botHit && !isGhostActive) {
        triggerGameOver();
        return;
      }
    }

    const newHead: Point = { x: nextX, y: nextY };

    // Check food consumption
    const foodIndex = foodItemsRef.current.findIndex(f => f.x === nextX && f.y === nextY);
    let didGrow = false;

    if (foodIndex !== -1) {
      const eatenFood = foodItemsRef.current[foodIndex];
      foodItemsRef.current.splice(foodIndex, 1);
      didGrow = true;
      applesEatenRef.current += 1;

      // Combo update
      if (now < comboExpireTimerRef.current) {
        comboRef.current = Math.min(10, comboRef.current + 1);
      } else {
        comboRef.current = 1;
      }
      comboExpireTimerRef.current = now + 3500;
      maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);
      onComboUpdate(comboRef.current, 1);

      // Score calculation
      const pointsGained = eatenFood.points * comboRef.current;
      scoreRef.current += pointsGained;

      // Handle specific food types
      if (eatenFood.type === 'golden') {
        goldenEatenRef.current += 1;
        sound.playEat(true, comboRef.current);
        if (settings.mode === 'time_attack') timeLeftRef.current += 5;
        addParticles(nextX, nextY, '#facc15', 20);
      } else if (eatenFood.type === 'regular') {
        sound.playEat(false, comboRef.current);
        if (settings.mode === 'time_attack') timeLeftRef.current += 3;
        addParticles(nextX, nextY, '#ef4444', 12);
      } else if (eatenFood.type === 'scissors') {
        // Cut 25% length
        sound.playTrim();
        const trimCount = Math.max(1, Math.floor(playerSnakeRef.current.length * 0.25));
        for (let i = 0; i < trimCount; i++) {
          if (playerSnakeRef.current.length > 3) {
            const popped = playerSnakeRef.current.pop();
            if (popped) addParticles(popped.x, popped.y, '#fb923c', 4);
          }
        }
        didGrow = false;
      } else {
        // Activate power-up duration
        sound.playPowerUp();
        let duration = 6000;
        let name = 'Power-up';
        let color = '#10b981';

        if (eatenFood.type === 'frost') {
          duration = 6500;
          name = 'Frost Slow';
          color = '#38bdf8';
        } else if (eatenFood.type === 'ghost') {
          duration = 6000;
          name = 'Ghost Phase';
          color = '#c084fc';
        } else if (eatenFood.type === 'magnet') {
          duration = 8000;
          name = 'Magnet Aura';
          color = '#ec4899';
        }

        activePowerUpsRef.current.push({
          type: eatenFood.type,
          durationMs: duration,
          expiresAt: now + duration,
          name,
        });
        addParticles(nextX, nextY, color, 16);
      }

      spawnFood();
    }

    // Magnet power-up effect
    const hasMagnet = activePowerUpsRef.current.some(p => p.type === 'magnet');
    if (hasMagnet) {
      applyMagnetEffect(newHead);
    }

    // Move player snake body
    const nextBody = [newHead, ...playerSnakeRef.current];
    if (!didGrow) {
      nextBody.pop();
    }
    playerSnakeRef.current = nextBody;

    // Move AI Bot if in Bot Battle mode
    if (settings.mode === 'bot_battle') {
      const botNextDir = getBotNextDirection({
        botSnake: botSnakeRef.current,
        playerSnake: playerSnakeRef.current,
        foodItems: foodItemsRef.current,
        obstacles: obstaclesRef.current,
        gridSize,
        allowWallPass: settings.allowWallPass,
        currentDirection: botDirectionRef.current,
      });
      botDirectionRef.current = botNextDir;

      const botVec = DIRECTION_VECTORS[botNextDir];
      const botHead = botSnakeRef.current[0];
      let botNextX = botHead.x + botVec.x;
      let botNextY = botHead.y + botVec.y;

      if (settings.allowWallPass) {
        botNextX = (botNextX + gridSize) % gridSize;
        botNextY = (botNextY + gridSize) % gridSize;
      }

      // Check if bot crashed into wall or player snake
      const hitPlayer = playerSnakeRef.current.some(s => s.x === botNextX && s.y === botNextY);
      const hitWall = !settings.allowWallPass && (botNextX < 0 || botNextX >= gridSize || botNextY < 0 || botNextY >= gridSize);
      const hitObstacle = obstaclesRef.current.some(o => o.type === 'wall' && o.x === botNextX && o.y === botNextY);

      if (hitPlayer || hitWall || hitObstacle) {
        // Bot eliminated! Player wins bounty
        botDefeatedRef.current = true;
        scoreRef.current += 300;
        sound.playVictory();
        addParticles(botHead.x, botHead.y, '#f43f5e', 24);

        // Respawn bot in a safe corner
        botSnakeRef.current = [
          { x: 3, y: 3 },
          { x: 2, y: 3 },
          { x: 1, y: 3 },
        ];
        botDirectionRef.current = 'RIGHT';
      } else {
        // Check if bot eats food
        const botFoodIdx = foodItemsRef.current.findIndex(f => f.x === botNextX && f.y === botNextY);
        let botGrew = false;
        if (botFoodIdx !== -1) {
          foodItemsRef.current.splice(botFoodIdx, 1);
          botGrew = true;
          botScoreRef.current += 10;
          spawnFood();
        }

        const newBotBody = [{ x: botNextX, y: botNextY }, ...botSnakeRef.current];
        if (!botGrew) {
          newBotBody.pop();
        }
        botSnakeRef.current = newBotBody;
        callbacksRef.current.onBotUpdate(botScoreRef.current, botSnakeRef.current.length);
      }
    }

    callbacksRef.current.onScoreUpdate(scoreRef.current, playerSnakeRef.current.length);
  }, [
    gameStatus,
    settings.mode,
    settings.allowWallPass,
    gridSize,
    getTickSpeed,
    spawnFood,
    triggerGameOver,
  ]);

  const stepGameRef = useRef(stepGame);
  stepGameRef.current = stepGame;

  const getTickSpeedRef = useRef(getTickSpeed);
  getTickSpeedRef.current = getTickSpeed;

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const minDistance = 24;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minDistance) {
        handleDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > minDistance) {
        handleDirectionInput(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  // 60FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      // Handle game tick execution
      const currentTickSpeed = getTickSpeedRef.current();
      if (time - lastTickTimeRef.current >= currentTickSpeed) {
        lastTickTimeRef.current = time;
        stepGameRef.current();
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cellSize = displayWidth / gridSize;
      const theme = THEMES[settings.theme] || THEMES.emerald;

      // Clear background
      ctx.fillStyle = theme.bgCanvas;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Draw subtle grid lines
      if (settings.showGridLines) {
        ctx.strokeStyle = theme.gridLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= gridSize; i++) {
          const pos = i * cellSize;
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, displayHeight);
          ctx.moveTo(0, pos);
          ctx.lineTo(displayWidth, pos);
        }
        ctx.stroke();
      }

      // Draw solid wall borders if solid wall mode
      if (!settings.allowWallPass) {
        ctx.strokeStyle = theme.wallColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = theme.wallGlow;
        ctx.shadowBlur = 6;
        ctx.strokeRect(1.5, 1.5, displayWidth - 3, displayHeight - 3);
        ctx.shadowBlur = 0;
      }

      // Draw Obstacles (Mazes & Portals)
      obstaclesRef.current.forEach(obs => {
        const ox = obs.x * cellSize;
        const oy = obs.y * cellSize;

        if (obs.type === 'wall') {
          ctx.fillStyle = theme.wallColor;
          ctx.fillRect(ox + 1, oy + 1, cellSize - 2, cellSize - 2);

          // Beveled border effect
          ctx.strokeStyle = theme.wallGlow;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ox + 1.5, oy + 1.5, cellSize - 3, cellSize - 3);
        } else if (obs.type === 'portal') {
          // Animated swirling portal wormhole
          const pColor = obs.portalColor || '#06b6d4';
          const pCenterX = ox + cellSize / 2;
          const pCenterY = oy + cellSize / 2;
          const pRadius = cellSize * 0.44;

          ctx.save();
          ctx.translate(pCenterX, pCenterY);
          ctx.rotate((time / 400) % (Math.PI * 2));

          // Outer portal ring glow
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = pColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, pRadius, 0, Math.PI * 1.5);
          ctx.stroke();

          // Inner core
          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.arc(0, 0, pRadius * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Draw Foods with animations
      foodItemsRef.current.forEach(food => {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const radius = cellSize * 0.38;
        const pulse = Math.sin(time / 200) * 1.5;

        ctx.save();

        if (food.type === 'golden') {
          // Golden sparkle
          ctx.shadowColor = theme.goldenGlow;
          ctx.shadowBlur = 12;
          ctx.fillStyle = theme.goldenColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle rays
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(fx - 4, fy);
          ctx.lineTo(fx + 4, fy);
          ctx.moveTo(fx, fy - 4);
          ctx.lineTo(fx, fy + 4);
          ctx.stroke();
        } else if (food.type === 'frost') {
          ctx.shadowColor = theme.frostColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = theme.frostColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Frost crystal core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, fy, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (food.type === 'ghost') {
          ctx.shadowColor = theme.ghostColor;
          ctx.shadowBlur = 12;
          ctx.fillStyle = theme.ghostColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius + pulse, 0, Math.PI * 2);
          ctx.fill();
        } else if (food.type === 'magnet') {
          ctx.shadowColor = theme.magnetColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = theme.magnetColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Orbit ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(fx, fy, radius * 1.2, radius * 0.5, time / 300, 0, Math.PI * 2);
          ctx.stroke();
        } else if (food.type === 'scissors') {
          ctx.shadowColor = theme.scissorsColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = theme.scissorsColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard apple
          ctx.shadowColor = theme.appleGlow;
          ctx.shadowBlur = 8;
          ctx.fillStyle = theme.appleColor;
          ctx.beginPath();
          ctx.arc(fx, fy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Cute leaf on top
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(fx + 2, fy - radius * 0.9, 3, 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw AI Rival Bot snake (if active)
      if (settings.mode === 'bot_battle') {
        const bot = botSnakeRef.current;
        bot.forEach((seg, i) => {
          const bx = seg.x * cellSize;
          const by = seg.y * cellSize;
          const isBotHead = i === 0;

          ctx.fillStyle = isBotHead ? theme.botHead : theme.botBodyGradStart;
          ctx.shadowColor = theme.botHead;
          ctx.shadowBlur = isBotHead ? 8 : 2;

          ctx.beginPath();
          ctx.roundRect(bx + 1.5, by + 1.5, cellSize - 3, cellSize - 3, isBotHead ? 6 : 4);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      // Draw Player Snake
      const snake = playerSnakeRef.current;
      const isGhost = activePowerUpsRef.current.some(p => p.type === 'ghost');

      ctx.save();
      if (isGhost) {
        ctx.globalAlpha = 0.55 + Math.sin(time / 150) * 0.15;
      }

      // Body segments
      for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        const isHead = i === 0;
        const sx = segment.x * cellSize;
        const sy = segment.y * cellSize;
        const t = i / Math.max(1, snake.length - 1);

        // Smooth skin rendering styles
        if (isHead) {
          ctx.fillStyle = isGhost ? theme.ghostColor : theme.playerHead;
          ctx.shadowColor = isGhost ? theme.ghostColor : theme.playerHead;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
          if (settings.skin === 'pixel') {
            ctx.fillStyle = theme.playerBodyGradStart;
          } else {
            // Gradient interpolation
            ctx.fillStyle = theme.playerBodyGradStart;
          }
        }

        const r = settings.skin === 'pixel' ? 2 : settings.skin === 'segmented' ? 8 : 6;
        ctx.beginPath();
        ctx.roundRect(sx + 1.5, sy + 1.5, cellSize - 3, cellSize - 3, r);
        ctx.fill();

        // Cyber grid accent line on segments
        if (settings.skin === 'cyber' && !isHead) {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx + 3, sy + 3, cellSize - 6, cellSize - 6);
        }
      }

      // Snake Head Eyes & Directional Face
      if (snake.length > 0) {
        const head = snake[0];
        const hx = head.x * cellSize + cellSize / 2;
        const hy = head.y * cellSize + cellSize / 2;
        const dir = currentDirectionRef.current;

        // Position two eyes relative to motion direction
        let eye1: Point = { x: -3.5, y: -3.5 };
        let eye2: Point = { x: 3.5, y: -3.5 };
        let pupilOffset: Point = { x: 0, y: -1.5 };

        if (dir === 'DOWN') {
          eye1 = { x: -3.5, y: 3.5 };
          eye2 = { x: 3.5, y: 3.5 };
          pupilOffset = { x: 0, y: 1.5 };
        } else if (dir === 'LEFT') {
          eye1 = { x: -3.5, y: -3.5 };
          eye2 = { x: -3.5, y: 3.5 };
          pupilOffset = { x: -1.5, y: 0 };
        } else if (dir === 'RIGHT') {
          eye1 = { x: 3.5, y: -3.5 };
          eye2 = { x: 3.5, y: 3.5 };
          pupilOffset = { x: 1.5, y: 0 };
        }

        ctx.shadowBlur = 0;
        // Sclera
        ctx.fillStyle = theme.playerEye;
        [eye1, eye2].forEach(eye => {
          ctx.beginPath();
          ctx.arc(hx + eye.x, hy + eye.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Pupils
        ctx.fillStyle = '#0f172a';
        [eye1, eye2].forEach(eye => {
          ctx.beginPath();
          ctx.arc(hx + eye.x + pupilOffset.x, hy + eye.y + pupilOffset.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Occasional animated tongue flick
        tongueTimerRef.current = (tongueTimerRef.current + 1) % 180;
        if (tongueTimerRef.current < 16) {
          const v = DIRECTION_VECTORS[dir];
          ctx.strokeStyle = theme.playerTongue;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const tongueStart = { x: hx + v.x * (cellSize * 0.45), y: hy + v.y * (cellSize * 0.45) };
          const tongueEnd = { x: hx + v.x * (cellSize * 0.75), y: hy + v.y * (cellSize * 0.75) };
          ctx.moveTo(tongueStart.x, tongueStart.y);
          ctx.lineTo(tongueEnd.x, tongueEnd.y);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [gridSize, settings.theme, settings.showGridLines, settings.allowWallPass, settings.mode, settings.skin]);

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto select-none touch-none rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block cursor-pointer"
        onClick={() => {
          if (gameStatus === 'PAUSED' && callbacksRef.current.onRequestResume) {
            callbacksRef.current.onRequestResume();
          }
        }}
      />

      {/* Paused Overlay */}
      {gameStatus === 'PAUSED' && (
        <div
          onClick={() => {
            if (callbacksRef.current.onRequestResume) {
              callbacksRef.current.onRequestResume();
            }
          }}
          className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 cursor-pointer animate-in fade-in"
        >
          <div className="text-xl font-bold font-display text-white tracking-wide">Game Paused</div>
          <div className="text-xs text-emerald-400">Click or press Space to Resume</div>
        </div>
      )}

      {/* Menu / Ready to Play Overlay */}
      {gameStatus === 'MENU' && (
        <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl">
            🐍
          </div>
          <h1 className="text-2xl font-bold font-display text-white">
            Ready to Slither?
          </h1>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            {settings.mode === 'classic' && 'Classic retro snake. Grow as long as possible without hitting walls or your tail.'}
            {settings.mode === 'obstacles' && 'Dodge stone walls and dive into paired quantum portals to teleport across the board.'}
            {settings.mode === 'time_attack' && '90-second sprint! Gobble fruits to recharge the countdown timer.'}
            {settings.mode === 'bot_battle' && 'Duel the AI Rival snake! Trap the bot or collect foods before it steals them.'}
          </p>
          <button
            onClick={onRequestResume}
            className="mt-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-display text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            Start Run (Space)
          </button>
        </div>
      )}
    </div>
  );
};
