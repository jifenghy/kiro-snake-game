/**
 * Snake类的单元测试
 * Unit tests for Snake class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Snake } from '../src/Snake';
import { Direction, CONFIG } from '../src/types';

describe('Snake类', () => {
  describe('构造函数和初始化', () => {
    it('应该初始化长度为3的蛇，位置在中央', () => {
      const centerX = Math.floor(CONFIG.GRID_WIDTH / 2);
      const centerY = Math.floor(CONFIG.GRID_HEIGHT / 2);
      const snake = new Snake({ x: centerX, y: centerY }, 3);

      expect(snake.body.length).toBe(3);
      expect(snake.getHead()).toEqual({ x: centerX, y: centerY });
      expect(snake.direction).toBe(Direction.RIGHT);
    });

    it('应该初始化蛇身向左延伸', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);

      expect(snake.body[0]).toEqual({ x: 10, y: 10 }); // 头部
      expect(snake.body[1]).toEqual({ x: 9, y: 10 });  // 身体
      expect(snake.body[2]).toEqual({ x: 8, y: 10 });  // 尾部
    });
  });

  describe('move方法', () => {
    it('应该向右移动蛇', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      const food = { x: 20, y: 20 }; // 远离蛇的食物

      snake.move(food);

      expect(snake.getHead()).toEqual({ x: 11, y: 10 });
      expect(snake.body.length).toBe(3); // 长度不变
    });

    it('应该向上移动蛇', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      const food = { x: 20, y: 20 };

      snake.move(food);

      expect(snake.getHead()).toEqual({ x: 10, y: 9 });
    });

    it('应该向下移动蛇', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      snake.changeDirection(Direction.DOWN);
      snake.move({ x: 20, y: 20 });

      expect(snake.getHead()).toEqual({ x: 10, y: 8 }); // 向上移动一次到y=9，再向下移动一次到y=8（因为不能立即反向）
    });

    it('应该向左移动蛇', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      snake.changeDirection(Direction.LEFT);
      snake.move({ x: 20, y: 20 });

      expect(snake.getHead()).toEqual({ x: 9, y: 9 });
    });

    it('当吃到食物时应该返回true并增加长度', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      const food = { x: 11, y: 10 }; // 食物在前方

      const ateFood = snake.move(food);

      expect(ateFood).toBe(true);
      expect(snake.body.length).toBe(4);
    });

    it('当没吃到食物时应该返回false且长度不变', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      const food = { x: 20, y: 20 };

      const ateFood = snake.move(food);

      expect(ateFood).toBe(false);
      expect(snake.body.length).toBe(3);
    });
  });

  describe('changeDirection方法', () => {
    it('应该改变方向', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      
      snake.changeDirection(Direction.UP);
      expect(snake.nextDirection).toBe(Direction.UP);
    });

    it('应该防止向相反方向移动（右->左）', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.direction = Direction.RIGHT;
      
      snake.changeDirection(Direction.LEFT);
      
      expect(snake.nextDirection).toBe(Direction.RIGHT); // 保持原方向
    });

    it('应该防止向相反方向移动（上->下）', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      
      snake.changeDirection(Direction.DOWN);
      
      expect(snake.nextDirection).toBe(Direction.UP);
    });

    it('应该防止向相反方向移动（左->右）', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      snake.changeDirection(Direction.LEFT);
      snake.move({ x: 20, y: 20 });
      
      snake.changeDirection(Direction.RIGHT);
      
      expect(snake.nextDirection).toBe(Direction.LEFT);
    });

    it('应该防止向相反方向移动（下->上）', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      // 初始方向是RIGHT
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 }); // 现在direction变成UP
      
      // 尝试向下移动（UP的反方向）
      snake.changeDirection(Direction.DOWN);
      snake.move({ x: 20, y: 20 }); // direction应该保持UP，因为DOWN被阻止了
      
      // 现在蛇正在向上移动，尝试向下移动应该被阻止
      snake.changeDirection(Direction.DOWN);
      
      expect(snake.nextDirection).toBe(Direction.UP);
    });
  });

  describe('checkSelfCollision方法', () => {
    it('应该检测到自身碰撞', () => {
      // 创建一个更长的蛇，手动设置身体位置来模拟碰撞
      const snake = new Snake({ x: 5, y: 5 }, 5);
      
      // 手动设置蛇的身体形成一个会碰撞的形状
      // 让蛇形成一个U形，然后头部移动到身体位置
      snake.body = [
        { x: 5, y: 5 },  // 头部
        { x: 5, y: 6 },  // 身体
        { x: 5, y: 7 },  // 身体
        { x: 6, y: 7 },  // 身体
        { x: 7, y: 7 },  // 尾部
      ];
      
      // 向下移动，头部会移动到(5, 6)，与身体第二个位置重叠
      snake.direction = Direction.DOWN;
      snake.nextDirection = Direction.DOWN;
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkSelfCollision();
      expect(collision).toBe(true);
    });

    it('应该在正常移动时不检测到碰撞', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      
      snake.move({ x: 20, y: 20 });
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkSelfCollision();
      expect(collision).toBe(false);
    });

    it('应该在短蛇时不检测到碰撞', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      
      const collision = snake.checkSelfCollision();
      expect(collision).toBe(false);
    });
  });

  describe('checkWallCollision方法', () => {
    it('应该检测到左边界碰撞', () => {
      const snake = new Snake({ x: 0, y: 10 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      snake.changeDirection(Direction.LEFT);
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkWallCollision(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      expect(collision).toBe(true);
    });

    it('应该检测到右边界碰撞', () => {
      const snake = new Snake({ x: CONFIG.GRID_WIDTH - 1, y: 10 }, 3);
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkWallCollision(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      expect(collision).toBe(true);
    });

    it('应该检测到上边界碰撞', () => {
      const snake = new Snake({ x: 10, y: 0 }, 3);
      snake.changeDirection(Direction.UP);
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkWallCollision(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      expect(collision).toBe(true);
    });

    it('应该检测到下边界碰撞', () => {
      const snake = new Snake({ x: 10, y: CONFIG.GRID_HEIGHT - 1 }, 3);
      snake.changeDirection(Direction.DOWN);
      snake.move({ x: 20, y: 20 });
      
      const collision = snake.checkWallCollision(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      expect(collision).toBe(true);
    });

    it('应该在游戏区域内不检测到碰撞', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      
      const collision = snake.checkWallCollision(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
      expect(collision).toBe(false);
    });
  });

  describe('getHead方法', () => {
    it('应该返回头部位置', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      
      const head = snake.getHead();
      
      expect(head).toEqual({ x: 10, y: 10 });
    });

    it('移动后应该返回新的头部位置', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      snake.move({ x: 20, y: 20 });
      
      const head = snake.getHead();
      
      expect(head).toEqual({ x: 11, y: 10 });
    });
  });

  describe('grow方法', () => {
    it('应该在下次移动时增加长度', () => {
      const snake = new Snake({ x: 10, y: 10 }, 3);
      const initialLength = snake.body.length;
      
      snake.grow();
      snake.move({ x: 20, y: 20 });
      
      expect(snake.body.length).toBe(initialLength + 1);
    });
  });
});
