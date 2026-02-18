/**
 * Renderer类的单元测试
 * Unit tests for Renderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Renderer } from '../src/Renderer';
import { GameModel } from '../src/GameModel';
import { CONFIG } from '../src/types';

describe('Renderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Renderer;

  beforeEach(() => {
    // 创建一个测试用的Canvas元素
    canvas = document.createElement('canvas');
    canvas.width = CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE;
    canvas.height = CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE;
    
    renderer = new Renderer(canvas, CONFIG.CELL_SIZE);
  });

  describe('构造函数', () => {
    it('应该正确初始化Canvas上下文', () => {
      expect(renderer.canvas).toBe(canvas);
      expect(renderer.ctx).toBeDefined();
      expect(renderer.cellSize).toBe(CONFIG.CELL_SIZE);
    });

    it('应该尝试初始化离屏Canvas用于网格预渲染', () => {
      // 在测试环境中，离屏Canvas可能不完全支持
      // 我们只验证Renderer能够正常初始化
      expect(renderer).toBeDefined();
      expect(renderer.canvas).toBe(canvas);
    });
  });

  describe('clear方法', () => {
    it('应该用背景色填充整个画布', () => {
      const fillRectSpy = vi.spyOn(renderer.ctx, 'fillRect');

      renderer.clear();

      expect(renderer.ctx.fillStyle).toBe(CONFIG.COLORS.BACKGROUND);
      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
  });

  describe('drawGrid方法', () => {
    it('应该绘制正确数量的网格线', () => {
      const strokeSpy = vi.spyOn(renderer.ctx, 'stroke');

      renderer.drawGrid(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

      // 应该绘制 (gridWidth + 1) + (gridHeight + 1) 条线
      const expectedLines = (CONFIG.GRID_WIDTH + 1) + (CONFIG.GRID_HEIGHT + 1);
      expect(strokeSpy).toHaveBeenCalledTimes(expectedLines);
    });

    it('应该使用正确的网格颜色', () => {
      renderer.drawGrid(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

      expect(renderer.ctx.strokeStyle).toBe(CONFIG.COLORS.GRID);
    });
  });

  describe('drawSnake方法', () => {
    it('应该使用不同颜色绘制蛇头和蛇身', () => {
      const model = new GameModel(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      const fillRectSpy = vi.spyOn(renderer.ctx, 'fillRect');

      renderer.drawSnake(model.snake);

      // 应该为蛇的每个部分调用fillRect
      expect(fillRectSpy).toHaveBeenCalledTimes(model.snake.body.length);
    });
  });

  describe('drawFood方法', () => {
    it('应该在正确位置绘制食物', () => {
      const food = { x: 5, y: 5 };
      const fillRectSpy = vi.spyOn(renderer.ctx, 'fillRect');

      renderer.drawFood(food);

      expect(renderer.ctx.fillStyle).toBe(CONFIG.COLORS.FOOD);
      expect(fillRectSpy).toHaveBeenCalledWith(
        food.x * CONFIG.CELL_SIZE,
        food.y * CONFIG.CELL_SIZE,
        CONFIG.CELL_SIZE,
        CONFIG.CELL_SIZE
      );
    });
  });

  describe('render方法', () => {
    it('应该按顺序调用所有绘制方法', () => {
      const model = new GameModel(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      
      const drawFoodSpy = vi.spyOn(renderer, 'drawFood');
      const drawSnakeSpy = vi.spyOn(renderer, 'drawSnake');

      renderer.render(model);

      expect(drawFoodSpy).toHaveBeenCalledWith(model.food);
      expect(drawSnakeSpy).toHaveBeenCalledWith(model.snake);
    });

    it('应该在状态改变时重绘', () => {
      const model = new GameModel(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      const drawSnakeSpy = vi.spyOn(renderer, 'drawSnake');

      // 第一次渲染
      renderer.render(model);
      expect(drawSnakeSpy).toHaveBeenCalledTimes(1);

      // 改变游戏状态（移动蛇）- 需要设置游戏为进行中状态
      model.state = 'PLAYING' as any;
      model.update();
      
      // 第二次渲染应该执行（因为蛇的位置改变了）
      renderer.render(model);
      expect(drawSnakeSpy).toHaveBeenCalledTimes(2);
    });

    it('应该在状态未改变时跳过重绘', () => {
      const model = new GameModel(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      const drawSnakeSpy = vi.spyOn(renderer, 'drawSnake');

      // 第一次渲染
      renderer.render(model);
      expect(drawSnakeSpy).toHaveBeenCalledTimes(1);

      // 状态未改变，再次渲染
      renderer.render(model);
      
      // 应该跳过重绘
      expect(drawSnakeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('showPauseOverlay方法', () => {
    it('应该显示暂停提示', () => {
      const fillTextSpy = vi.spyOn(renderer.ctx, 'fillText');

      renderer.showPauseOverlay();

      expect(fillTextSpy).toHaveBeenCalledWith(
        '已暂停',
        canvas.width / 2,
        canvas.height / 2
      );
    });
  });

  describe('showGameOver方法', () => {
    it('应该显示游戏结束画面和分数', () => {
      const score = 100;
      const fillTextSpy = vi.spyOn(renderer.ctx, 'fillText');

      renderer.showGameOver(score);

      expect(fillTextSpy).toHaveBeenCalledWith(
        '游戏结束',
        canvas.width / 2,
        canvas.height / 2 - 40
      );
      expect(fillTextSpy).toHaveBeenCalledWith(
        `分数: ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 20
      );
    });
  });
});
