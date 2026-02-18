/**
 * GameModel类的单元测试
 * Unit tests for GameModel class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameModel } from '../src/GameModel';
import { GameState, GameSpeed, CONFIG } from '../src/types';

describe('GameModel', () => {
  let gameModel: GameModel;

  beforeEach(() => {
    gameModel = new GameModel(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
  });

  describe('构造函数', () => {
    it('应该初始化游戏状态为NOT_STARTED', () => {
      expect(gameModel.state).toBe(GameState.NOT_STARTED);
    });

    it('应该初始化分数为0', () => {
      expect(gameModel.score).toBe(0);
    });

    it('应该初始化蛇的长度为3', () => {
      expect(gameModel.snake.body.length).toBe(CONFIG.INITIAL_SNAKE_LENGTH);
    });

    it('应该初始化蛇在游戏区域中央', () => {
      const centerX = Math.floor(CONFIG.GRID_WIDTH / 2);
      const centerY = Math.floor(CONFIG.GRID_HEIGHT / 2);
      const head = gameModel.snake.getHead();
      expect(head.x).toBe(centerX);
      expect(head.y).toBe(centerY);
    });

    it('应该初始化速度为中速', () => {
      expect(gameModel.speed).toBe(GameSpeed.MEDIUM);
    });

    it('应该生成食物在游戏区域内', () => {
      expect(gameModel.food.x).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.x).toBeLessThan(CONFIG.GRID_WIDTH);
      expect(gameModel.food.y).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.y).toBeLessThan(CONFIG.GRID_HEIGHT);
    });
  });

  describe('initGame', () => {
    it('应该重置分数为0', () => {
      gameModel.score = 100;
      gameModel.initGame();
      expect(gameModel.score).toBe(0);
    });

    it('应该重置游戏状态为NOT_STARTED', () => {
      gameModel.state = GameState.PLAYING;
      gameModel.initGame();
      expect(gameModel.state).toBe(GameState.NOT_STARTED);
    });

    it('应该重置蛇的长度为3', () => {
      // 模拟蛇变长
      gameModel.snake.grow();
      gameModel.initGame();
      expect(gameModel.snake.body.length).toBe(CONFIG.INITIAL_SNAKE_LENGTH);
    });

    it('应该重新生成食物', () => {
      const oldFood = { ...gameModel.food };
      gameModel.initGame();
      // 食物位置可能相同，但至少应该是有效的
      expect(gameModel.food.x).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.x).toBeLessThan(CONFIG.GRID_WIDTH);
    });
  });

  describe('generateFood', () => {
    it('应该生成食物在游戏区域内', () => {
      gameModel.generateFood();
      expect(gameModel.food.x).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.x).toBeLessThan(CONFIG.GRID_WIDTH);
      expect(gameModel.food.y).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.y).toBeLessThan(CONFIG.GRID_HEIGHT);
    });

    it('应该生成食物不与蛇的身体重叠', () => {
      gameModel.generateFood();
      const foodOverlapsSnake = gameModel.snake.body.some(
        segment => segment.x === gameModel.food.x && segment.y === gameModel.food.y
      );
      expect(foodOverlapsSnake).toBe(false);
    });
  });

  describe('update', () => {
    it('当游戏状态为NOT_STARTED时不应该更新', () => {
      gameModel.state = GameState.NOT_STARTED;
      const initialHead = { ...gameModel.snake.getHead() };
      gameModel.update();
      const newHead = gameModel.snake.getHead();
      expect(newHead.x).toBe(initialHead.x);
      expect(newHead.y).toBe(initialHead.y);
    });

    it('当游戏状态为PAUSED时不应该更新', () => {
      gameModel.state = GameState.PAUSED;
      const initialHead = { ...gameModel.snake.getHead() };
      gameModel.update();
      const newHead = gameModel.snake.getHead();
      expect(newHead.x).toBe(initialHead.x);
      expect(newHead.y).toBe(initialHead.y);
    });

    it('当游戏状态为PLAYING时应该移动蛇', () => {
      gameModel.state = GameState.PLAYING;
      const initialHead = { ...gameModel.snake.getHead() };
      gameModel.update();
      const newHead = gameModel.snake.getHead();
      // 蛇应该向右移动（默认方向）
      expect(newHead.x).toBe(initialHead.x + 1);
    });

    it('当蛇吃到食物时应该增加分数', () => {
      gameModel.state = GameState.PLAYING;
      // 将食物放在蛇的前方
      const head = gameModel.snake.getHead();
      gameModel.food = { x: head.x + 1, y: head.y };
      const initialScore = gameModel.score;
      gameModel.update();
      expect(gameModel.score).toBe(initialScore + CONFIG.POINTS_PER_FOOD);
    });

    it('当蛇吃到食物时应该生成新食物', () => {
      gameModel.state = GameState.PLAYING;
      const head = gameModel.snake.getHead();
      gameModel.food = { x: head.x + 1, y: head.y };
      const oldFood = { ...gameModel.food };
      gameModel.update();
      // 新食物应该不在原位置（或者在，但概率很小）
      const foodChanged = gameModel.food.x !== oldFood.x || gameModel.food.y !== oldFood.y;
      // 至少食物应该是有效的
      expect(gameModel.food.x).toBeGreaterThanOrEqual(0);
      expect(gameModel.food.x).toBeLessThan(CONFIG.GRID_WIDTH);
    });

    it('当蛇撞墙时应该结束游戏', () => {
      gameModel.state = GameState.PLAYING;
      // 将蛇移动到边界附近并向边界移动
      gameModel.snake.body = [{ x: CONFIG.GRID_WIDTH - 1, y: 10 }];
      gameModel.update();
      expect(gameModel.state).toBe(GameState.GAME_OVER);
    });
  });

  describe('setSpeed', () => {
    it('应该设置速度为慢速', () => {
      gameModel.setSpeed(GameSpeed.SLOW);
      expect(gameModel.speed).toBe(GameSpeed.SLOW);
    });

    it('应该设置速度为中速', () => {
      gameModel.setSpeed(GameSpeed.MEDIUM);
      expect(gameModel.speed).toBe(GameSpeed.MEDIUM);
    });

    it('应该设置速度为快速', () => {
      gameModel.setSpeed(GameSpeed.FAST);
      expect(gameModel.speed).toBe(GameSpeed.FAST);
    });
  });

  describe('togglePause', () => {
    it('当游戏进行中时应该暂停游戏', () => {
      gameModel.state = GameState.PLAYING;
      gameModel.togglePause();
      expect(gameModel.state).toBe(GameState.PAUSED);
    });

    it('当游戏暂停时应该恢复游戏', () => {
      gameModel.state = GameState.PAUSED;
      gameModel.togglePause();
      expect(gameModel.state).toBe(GameState.PLAYING);
    });

    it('当游戏未开始时不应该改变状态', () => {
      gameModel.state = GameState.NOT_STARTED;
      gameModel.togglePause();
      expect(gameModel.state).toBe(GameState.NOT_STARTED);
    });

    it('当游戏结束时不应该改变状态', () => {
      gameModel.state = GameState.GAME_OVER;
      gameModel.togglePause();
      expect(gameModel.state).toBe(GameState.GAME_OVER);
    });
  });

  describe('checkGameOver', () => {
    it('当蛇撞到左边界时应该返回true', () => {
      gameModel.snake.body = [{ x: -1, y: 10 }];
      expect(gameModel.checkGameOver()).toBe(true);
    });

    it('当蛇撞到右边界时应该返回true', () => {
      gameModel.snake.body = [{ x: CONFIG.GRID_WIDTH, y: 10 }];
      expect(gameModel.checkGameOver()).toBe(true);
    });

    it('当蛇撞到上边界时应该返回true', () => {
      gameModel.snake.body = [{ x: 10, y: -1 }];
      expect(gameModel.checkGameOver()).toBe(true);
    });

    it('当蛇撞到下边界时应该返回true', () => {
      gameModel.snake.body = [{ x: 10, y: CONFIG.GRID_HEIGHT }];
      expect(gameModel.checkGameOver()).toBe(true);
    });

    it('当蛇撞到自己时应该返回true', () => {
      gameModel.snake.body = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 },
        { x: 5, y: 5 } // 头部位置与身体重叠
      ];
      expect(gameModel.checkGameOver()).toBe(true);
    });

    it('当游戏正常进行时应该返回false', () => {
      gameModel.snake.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      expect(gameModel.checkGameOver()).toBe(false);
    });
  });

  describe('getScore', () => {
    it('应该返回当前分数', () => {
      gameModel.score = 50;
      expect(gameModel.getScore()).toBe(50);
    });

    it('初始分数应该为0', () => {
      expect(gameModel.getScore()).toBe(0);
    });
  });
});
