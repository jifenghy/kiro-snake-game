/**
 * GameModel类 - 管理游戏状态和逻辑
 * GameModel class - manages game state and logic
 */

import { Snake } from './Snake';
import { Position, Direction, GameState, GameSpeed, CONFIG } from './types';

export class GameModel {
  snake: Snake;
  food: Position;
  score: number;
  state: GameState;
  speed: GameSpeed;
  gridWidth: number;
  gridHeight: number;

  /**
   * 构造函数 - 初始化游戏状态
   * @param gridWidth 游戏区域宽度（格子数）
   * @param gridHeight 游戏区域高度（格子数）
   */
  constructor(gridWidth: number, gridHeight: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.score = 0;
    this.state = GameState.NOT_STARTED;
    this.speed = GameSpeed.MEDIUM;
    
    // 初始化蛇在中央位置
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    this.snake = new Snake(
      { x: centerX, y: centerY },
      CONFIG.INITIAL_SNAKE_LENGTH
    );
    
    // 初始化食物位置
    this.food = { x: 0, y: 0 };
    this.generateFood();
  }

  /**
   * 初始化新游戏 - 重置所有游戏状态
   */
  initGame(): void {
    this.score = 0;
    this.state = GameState.NOT_STARTED;
    
    // 重新创建蛇在中央位置
    const centerX = Math.floor(this.gridWidth / 2);
    const centerY = Math.floor(this.gridHeight / 2);
    this.snake = new Snake(
      { x: centerX, y: centerY },
      CONFIG.INITIAL_SNAKE_LENGTH
    );
    
    // 重新生成食物
    this.generateFood();
  }

  /**
   * 生成随机食物位置
   * 确保食物不会生成在蛇的身体上
   */
  generateFood(): void {
    let newFood: Position;
    let isValidPosition: boolean;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * this.gridWidth),
        y: Math.floor(Math.random() * this.gridHeight)
      };
      
      // 检查食物是否与蛇的身体重叠
      isValidPosition = !this.snake.body.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
    } while (!isValidPosition);
    
    this.food = newFood;
  }

  /**
   * 更新游戏状态 - 游戏主循环逻辑
   * 每帧调用一次
   */
  update(): void {
    // 只在游戏进行中时更新
    if (this.state !== GameState.PLAYING) {
      return;
    }
    
    // 移动蛇
    const ateFood = this.snake.move(this.food);
    
    // 如果吃到食物
    if (ateFood) {
      this.score += CONFIG.POINTS_PER_FOOD;
      this.generateFood();
    }
    
    // 检查游戏是否结束
    if (this.checkGameOver()) {
      this.state = GameState.GAME_OVER;
    }
  }

  /**
   * 设置游戏速度
   * @param speed 新的游戏速度
   */
  setSpeed(speed: GameSpeed): void {
    this.speed = speed;
  }

  /**
   * 切换暂停状态
   */
  togglePause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  /**
   * 检查游戏是否结束
   * @returns 游戏是否结束
   */
  checkGameOver(): boolean {
    // 检查墙壁碰撞
    if (this.snake.checkWallCollision(this.gridWidth, this.gridHeight)) {
      return true;
    }
    
    // 检查自身碰撞
    if (this.snake.checkSelfCollision()) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取当前分数
   * @returns 当前分数
   */
  getScore(): number {
    return this.score;
  }
}
