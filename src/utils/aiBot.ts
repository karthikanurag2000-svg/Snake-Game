import { Direction, Obstacle, Point } from '../types/game';

interface AIContext {
  botSnake: Point[];
  playerSnake: Point[];
  foodItems: Point[];
  obstacles: Obstacle[];
  gridSize: number;
  allowWallPass: boolean;
  currentDirection: Direction;
}

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const OPPOSITES: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const OFFSETS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function getNextCoord(head: Point, dir: Direction, gridSize: number, allowWallPass: boolean): Point | null {
  const offset = OFFSETS[dir];
  let nx = head.x + offset.x;
  let ny = head.y + offset.y;

  if (allowWallPass) {
    nx = (nx + gridSize) % gridSize;
    ny = (ny + gridSize) % gridSize;
  } else {
    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
      return null;
    }
  }

  return { x: nx, y: ny };
}

function isBlocked(
  pt: Point,
  botSnake: Point[],
  playerSnake: Point[],
  obstacles: Obstacle[]
): boolean {
  // Check collision with bot body (ignoring tail tip as it moves)
  const botBody = botSnake.slice(0, -1);
  if (botBody.some(p => p.x === pt.x && p.y === pt.y)) return true;

  // Check collision with player snake
  if (playerSnake.some(p => p.x === pt.x && p.y === pt.y)) return true;

  // Check collision with solid obstacles
  if (obstacles.some(o => o.type === 'wall' && o.x === pt.x && o.y === pt.y)) return true;

  return false;
}

/**
 * Flood fill count of reachable cells to evaluate safety of a candidate move
 */
function floodFillSpace(
  start: Point,
  botSnake: Point[],
  playerSnake: Point[],
  obstacles: Obstacle[],
  gridSize: number,
  allowWallPass: boolean,
  maxSteps = 80
): number {
  const visited = new Set<string>();
  const queue: Point[] = [start];
  visited.add(`${start.x},${start.y}`);

  let count = 0;
  while (queue.length > 0 && count < maxSteps) {
    const current = queue.shift()!;
    count++;

    for (const dir of DIRECTIONS) {
      const next = getNextCoord(current, dir, gridSize, allowWallPass);
      if (!next) continue;
      const key = `${next.x},${next.y}`;
      if (visited.has(key)) continue;

      if (!isBlocked(next, botSnake, playerSnake, obstacles)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }

  return count;
}

/**
 * Computes best next direction for the AI bot.
 */
export function getBotNextDirection(ctx: AIContext): Direction {
  const { botSnake, playerSnake, foodItems, obstacles, gridSize, allowWallPass, currentDirection } = ctx;
  const head = botSnake[0];

  // Legal moves: not opposite of current direction and not immediately crashing
  const legalDirs = DIRECTIONS.filter(dir => dir !== OPPOSITES[currentDirection]);

  const candidateMoves: { dir: Direction; nextPt: Point; score: number }[] = [];

  for (const dir of legalDirs) {
    const nextPt = getNextCoord(head, dir, gridSize, allowWallPass);
    if (!nextPt) continue;

    if (isBlocked(nextPt, botSnake, playerSnake, obstacles)) {
      continue;
    }

    // Safety space check
    const freeSpace = floodFillSpace(nextPt, botSnake, playerSnake, obstacles, gridSize, allowWallPass, 60);

    // If candidate traps bot into a pocket smaller than bot length, severely penalize
    if (freeSpace < botSnake.length) {
      candidateMoves.push({ dir, nextPt, score: freeSpace - 1000 });
      continue;
    }

    // Distance to nearest food
    let minFoodDist = Infinity;
    if (foodItems.length > 0) {
      for (const food of foodItems) {
        const dx = Math.abs(food.x - nextPt.x);
        const dy = Math.abs(food.y - nextPt.y);
        const dist = allowWallPass
          ? Math.min(dx, gridSize - dx) + Math.min(dy, gridSize - dy)
          : dx + dy;
        if (dist < minFoodDist) {
          minFoodDist = dist;
        }
      }
    } else {
      minFoodDist = 10;
    }

    // Heuristic: prioritize moving closer to food, with safety bonus for free space
    const score = 100 - minFoodDist * 5 + Math.min(freeSpace, 40);
    candidateMoves.push({ dir, nextPt, score });
  }

  if (candidateMoves.length === 0) {
    // If trapped, pick any move that doesn't reverse into itself
    return legalDirs[0] || currentDirection;
  }

  // Sort descending by score
  candidateMoves.sort((a, b) => b.score - a.score);
  return candidateMoves[0].dir;
}
