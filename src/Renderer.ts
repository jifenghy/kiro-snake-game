/**
 * Renderer类 - 负责Canvas渲染
 * Renderer class - handles Canvas rendering
 */

import { GameModel } from './GameModel';
import { Snake } from './Snake';
import { Position, CONFIG } from './types';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private lastRenderedState: string = '';

  /**
   * 构造函数 - 初始化Canvas上下文
   * @param canvas Canvas元素
   * @param cellSize 每个格子的像素大小
   */
  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('无法获取Canvas 2D上下文');
    }
    
    this.ctx = context;
    this.cellSize = cellSize;
    
    // 初始化离屏Canvas用于预渲染网格
    this.initOffscreenCanvas();
  }

  /**
   * 初始化离屏Canvas并预渲染网格
   */
  private initOffscreenCanvas(): void {
    // 在测试环境中跳过离屏Canvas初始化
    // 检查是否在测试环境中（vitest设置NODE_ENV=test）
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return;
    }
    
    // 在浏览器环境中尝试创建离屏Canvas
    try {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      
      const offscreenContext = this.offscreenCanvas.getContext('2d');
      if (!offscreenContext) {
        console.warn('无法创建离屏Canvas上下文，将使用常规渲染');
        this.offscreenCanvas = null;
        return;
      }
      
      this.offscreenCtx = offscreenContext;
      
      // 预渲染网格到离屏Canvas
      this.prerenderGrid();
    } catch (error) {
      console.warn('离屏Canvas初始化失败，将使用常规渲染', error);
      this.offscreenCanvas = null;
      this.offscreenCtx = null;
    }
  }

  /**
   * 预渲染网格到离屏Canvas
   */
  private prerenderGrid(): void {
    if (!this.offscreenCanvas || !this.offscreenCtx) {
      return;
    }

    const gridWidth = this.canvas.width / this.cellSize;
    const gridHeight = this.canvas.height / this.cellSize;

    // 绘制背景
    this.offscreenCtx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // 绘制网格线
    this.offscreenCtx.strokeStyle = CONFIG.COLORS.GRID;
    this.offscreenCtx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= gridWidth; x++) {
      this.offscreenCtx.beginPath();
      this.offscreenCtx.moveTo(x * this.cellSize, 0);
      this.offscreenCtx.lineTo(x * this.cellSize, gridHeight * this.cellSize);
      this.offscreenCtx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= gridHeight; y++) {
      this.offscreenCtx.beginPath();
      this.offscreenCtx.moveTo(0, y * this.cellSize);
      this.offscreenCtx.lineTo(gridWidth * this.cellSize, y * this.cellSize);
      this.offscreenCtx.stroke();
    }
  }

  /**
   * 渲染整个游戏画面（优化版：只在状态改变时重绘）
   * @param model 游戏模型
   */
  render(model: GameModel): void {
    // 生成当前状态的哈希值
    const currentState = this.generateStateHash(model);
    
    // 如果状态没有改变，跳过渲染
    if (currentState === this.lastRenderedState) {
      return;
    }
    
    // 更新最后渲染的状态
    this.lastRenderedState = currentState;
    
    // 使用离屏Canvas绘制背景和网格（如果可用）
    if (this.offscreenCanvas) {
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    } else {
      // 降级方案：直接绘制
      this.clear();
      this.drawGrid(model.gridWidth, model.gridHeight);
    }
    
    // 绘制动态元素
    this.drawFood(model.food);
    this.drawSnake(model.snake);
  }

  /**
   * 生成游戏状态的哈希值，用于检测状态变化
   * @param model 游戏模型
   * @returns 状态哈希字符串
   */
  private generateStateHash(model: GameModel): string {
    // 将蛇的位置、食物位置和游戏状态组合成字符串
    const snakePositions = model.snake.body
      .map(pos => `${pos.x},${pos.y}`)
      .join('|');
    
    return `${snakePositions}:${model.food.x},${model.food.y}:${model.state}`;
  }

  /**
   * 绘制蛇（蛇头和蛇身）
   * @param snake 蛇对象
   */
  drawSnake(snake: Snake): void {
    snake.body.forEach((segment, index) => {
      // 蛇头使用不同的颜色
      this.ctx.fillStyle = index === 0 ? CONFIG.COLORS.SNAKE_HEAD : CONFIG.COLORS.SNAKE_BODY;
      
      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    });
  }

  /**
   * 绘制食物
   * @param food 食物位置
   */
  drawFood(food: Position): void {
    this.ctx.fillStyle = CONFIG.COLORS.FOOD;
    
    this.ctx.fillRect(
      food.x * this.cellSize,
      food.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  /**
   * 绘制网格线
   * @param gridWidth 游戏区域宽度（格子数）
   * @param gridHeight 游戏区域高度（格子数）
   */
  drawGrid(gridWidth: number, gridHeight: number): void {
    this.ctx.strokeStyle = CONFIG.COLORS.GRID;
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, gridHeight * this.cellSize);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(gridWidth * this.cellSize, y * this.cellSize);
      this.ctx.stroke();
    }
  }

  /**
   * 显示暂停提示
   */
  showPauseOverlay(): void {
    // 绘制半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制暂停文本
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '已暂停',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 显示游戏结束画面
   * @param score 最终分数
   */
  showGameOver(score: number): void {
    // 绘制半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制游戏结束文本
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '游戏结束',
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    );

    // 绘制分数
    this.ctx.font = '24px Arial';
    this.ctx.fillText(
      `分数: ${score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    );
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
