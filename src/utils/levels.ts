import { Obstacle, Point } from '../types/game';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  obstacles: Obstacle[];
}

export function getLevelObstacles(levelIndex: number, gridSize: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const mid = Math.floor(gridSize / 2);

  switch (levelIndex % 4) {
    case 0: {
      // Crossroads & Corner Blocks
      // Center cross with gaps
      for (let i = 4; i < mid - 2; i++) {
        obstacles.push({ x: mid, y: i, type: 'wall' });
        obstacles.push({ x: mid, y: gridSize - 1 - i, type: 'wall' });
        obstacles.push({ x: i, y: mid, type: 'wall' });
        obstacles.push({ x: gridSize - 1 - i, y: mid, type: 'wall' });
      }
      // 4 corner blocks
      obstacles.push({ x: 3, y: 3, type: 'wall' });
      obstacles.push({ x: 4, y: 3, type: 'wall' });
      obstacles.push({ x: 3, y: 4, type: 'wall' });

      obstacles.push({ x: gridSize - 4, y: 3, type: 'wall' });
      obstacles.push({ x: gridSize - 5, y: 3, type: 'wall' });
      obstacles.push({ x: gridSize - 4, y: 4, type: 'wall' });

      obstacles.push({ x: 3, y: gridSize - 4, type: 'wall' });
      obstacles.push({ x: 4, y: gridSize - 4, type: 'wall' });
      obstacles.push({ x: 3, y: gridSize - 5, type: 'wall' });

      obstacles.push({ x: gridSize - 4, y: gridSize - 4, type: 'wall' });
      obstacles.push({ x: gridSize - 5, y: gridSize - 4, type: 'wall' });
      obstacles.push({ x: gridSize - 4, y: gridSize - 5, type: 'wall' });
      break;
    }
    case 1: {
      // The Fortress: inner ring with strategic openings
      const start = 4;
      const end = gridSize - 5;
      for (let x = start; x <= end; x++) {
        if (Math.abs(x - mid) > 2) {
          obstacles.push({ x, y: start, type: 'wall' });
          obstacles.push({ x, y: end, type: 'wall' });
        }
      }
      for (let y = start; y <= end; y++) {
        if (Math.abs(y - mid) > 2) {
          obstacles.push({ x: start, y, type: 'wall' });
          obstacles.push({ x: end, y, type: 'wall' });
        }
      }
      break;
    }
    case 2: {
      // Quantum Portals: Two paired wormholes (A <-> B)
      const p1A: Point = { x: 4, y: mid };
      const p1B: Point = { x: gridSize - 5, y: mid };
      const p2A: Point = { x: mid, y: 4 };
      const p2B: Point = { x: mid, y: gridSize - 5 };

      obstacles.push({
        x: p1A.x,
        y: p1A.y,
        type: 'portal',
        portalTarget: p1B,
        portalColor: '#06b6d4', // Cyan portal
      });
      obstacles.push({
        x: p1B.x,
        y: p1B.y,
        type: 'portal',
        portalTarget: p1A,
        portalColor: '#06b6d4',
      });
      obstacles.push({
        x: p2A.x,
        y: p2A.y,
        type: 'portal',
        portalTarget: p2B,
        portalColor: '#ec4899', // Pink portal
      });
      obstacles.push({
        x: p2B.x,
        y: p2B.y,
        type: 'portal',
        portalTarget: p2A,
        portalColor: '#ec4899',
      });

      // Scatter a few barrier posts
      obstacles.push({ x: Math.floor(gridSize * 0.25), y: Math.floor(gridSize * 0.25), type: 'wall' });
      obstacles.push({ x: Math.floor(gridSize * 0.75), y: Math.floor(gridSize * 0.25), type: 'wall' });
      obstacles.push({ x: Math.floor(gridSize * 0.25), y: Math.floor(gridSize * 0.75), type: 'wall' });
      obstacles.push({ x: Math.floor(gridSize * 0.75), y: Math.floor(gridSize * 0.75), type: 'wall' });
      break;
    }
    case 3: {
      // Twin Serpent Columns
      for (let y = 3; y < gridSize - 3; y++) {
        if (y % 4 !== 0) {
          obstacles.push({ x: Math.floor(gridSize * 0.33), y, type: 'wall' });
          obstacles.push({ x: Math.floor(gridSize * 0.66), y, type: 'wall' });
        }
      }
      break;
    }
  }

  return obstacles;
}
