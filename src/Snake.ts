/**
 * Snake类 - 管理蛇的状态和行为
 * Snake class - manages snake state and behavior
 */

import { Position, Direction, CONFIG } from './types';

export class Snake {
  body: Position[];        // 蛇的身体，第一个元素是头部
  direction: Direction;    // 当前移动方向
  nextDirection: Direction; // 下一步的方向（用于防止反向）
  private shouldGrow: boolean; // 标记是否需要增长

  /**
   * 构造函数 - 初始化蛇的位置和方向
   * @param initialPosition 初始头部位置
   * @param initialLength 初始长度
   */
  constructor(initialPosition: Position, initialLength: number) {
    this.body = [];
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.shouldGrow = false;

    // 初始化蛇的身体，从头部开始向左延伸
    for (let i = 0; i < initialLength; i++) {
      this.body.push({
        x: initialPosition.x - i,
        y: initialPosition.y
      });
    }
  }

  /**
   * 移动蛇并检测是否吃到食物
   * @param food 食物位置
   * @returns 是否吃到食物
   */
  move(food: Position): boolean {
    // 应用下一个方向
    this.direction = this.nextDirection;

    // 计算新的头部位置
    const head = this.getHead();
    const newHead: Position = { ...head };

    switch (this.direction) {
      case Direction.UP:
        newHead.y -= 1;
        break;
      case Direction.DOWN:
        newHead.y += 1;
        break;
      case Direction.LEFT:
        newHead.x -= 1;
        break;
      case Direction.RIGHT:
        newHead.x += 1;
        break;
    }

    // 将新头部添加到身体前面
    this.body.unshift(newHead);

    // 检查是否吃到食物
    const ateFood = newHead.x === food.x && newHead.y === food.y;

    if (ateFood) {
      this.shouldGrow = true;
    }

    // 如果没有吃到食物且不需要增长，移除尾部
    if (!this.shouldGrow) {
      this.body.pop();
    } else {
      this.shouldGrow = false;
    }

    return ateFood;
  }

  /**
   * 改变方向（带反向检查）
   * @param newDirection 新方向
   */
  changeDirection(newDirection: Direction): void {
    // 防止反向移动
    const opposites: Record<Direction, Direction> = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    // 如果新方向不是当前方向的反方向，则更新
    if (opposites[this.direction] !== newDirection) {
      this.nextDirection = newDirection;
    }
  }

  /**
   * 检查是否撞到自己
   * @returns 是否发生自身碰撞
   */
  checkSelfCollision(): boolean {
    const head = this.getHead();
    
    // 检查头部是否与身体的任何部分重叠（跳过头部本身）
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 检查是否撞到边界
   * @param gridWidth 游戏区域宽度
   * @param gridHeight 游戏区域高度
   * @returns 是否发生墙壁碰撞
   */
  checkWallCollision(gridWidth: number, gridHeight: number): boolean {
    const head = this.getHead();
    
    return (
      head.x < 0 ||
      head.x >= gridWidth ||
      head.y < 0 ||
      head.y >= gridHeight
    );
  }

  /**
   * 获取头部位置
   * @returns 头部位置
   */
  getHead(): Position {
    return this.body[0];
  }

  /**
   * 增长蛇的长度
   * 标记在下次移动时不移除尾部
   */
  grow(): void {
    this.shouldGrow = true;
  }
}
