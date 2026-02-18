/**
 * 核心数据类型和配置
 * Core data types and configuration for the Snake Game
 */

/**
 * 位置接口 - 表示游戏区域中的坐标
 * Position interface - represents coordinates in the game area
 */
export interface Position {
  x: number;  // X坐标（格子单位）
  y: number;  // Y坐标（格子单位）
}

/**
 * 方向枚举 - 蛇的移动方向
 * Direction enum - snake movement directions
 */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

/**
 * 游戏状态枚举
 * Game state enum
 */
export enum GameState {
  NOT_STARTED = 'NOT_STARTED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

/**
 * 游戏速度枚举 - 每秒移动的格子数
 * Game speed enum - cells per second
 */
export enum GameSpeed {
  SLOW = 5,    // 慢速：每秒5格
  MEDIUM = 10, // 中速：每秒10格
  FAST = 15    // 快速：每秒15格
}

/**
 * 排行榜条目接口
 * Leaderboard entry interface
 */
export interface LeaderboardEntry {
  score: number;
  date: string;  // ISO 8601格式
}

/**
 * 游戏配置常量
 * Game configuration constants
 */
export const CONFIG = {
  GRID_WIDTH: 20,        // 游戏区域宽度（格子数）
  GRID_HEIGHT: 20,       // 游戏区域高度（格子数）
  CELL_SIZE: 20,         // 每个格子的像素大小
  INITIAL_SNAKE_LENGTH: 3,
  POINTS_PER_FOOD: 10,
  LEADERBOARD_SIZE: 10,
  
  COLORS: {
    BACKGROUND: '#1a1a1a',
    GRID: '#2a2a2a',
    SNAKE_HEAD: '#4CAF50',
    SNAKE_BODY: '#66BB6A',
    FOOD: '#FF5252',
    TEXT: '#FFFFFF'
  }
} as const;
