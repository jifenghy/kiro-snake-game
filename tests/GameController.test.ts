/**
 * GameController单元测试
 * GameController unit tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GameController } from '../src/GameController';
import { Direction, GameState, GameSpeed } from '../src/types';

describe('GameController', () => {
  let canvas: HTMLCanvasElement;
  let controller: GameController;

  beforeEach(() => {
    // 创建模拟的Canvas元素
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    
    // 模拟Canvas 2D上下文
    const mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn()
    };
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);
    
    // 模拟DOM元素
    document.body.innerHTML = `
      <div id="currentScore">0</div>
      <div id="highScore">0</div>
      <div id="gameAnnouncements" class="sr-only" role="status" aria-live="polite"></div>
      <button id="startButton">开始</button>
      <button id="pauseButton">暂停</button>
      <button id="restartButton">重新开始</button>
      <button id="leaderboardButton">排行榜</button>
      <button class="speed-btn" data-speed="slow">慢速</button>
      <button class="speed-btn" data-speed="medium">中速</button>
      <button class="speed-btn" data-speed="fast">快速</button>
      <div id="leaderboardModal" style="display: none;">
        <span class="close">&times;</span>
        <div id="leaderboardList"></div>
      </div>
    `;

    // 创建GameController实例
    controller = new GameController(canvas, 20, 20, 20);
  });

  afterEach(() => {
    // 清理
    vi.restoreAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确初始化所有组件', () => {
      expect(controller).toBeDefined();
      expect(controller['model']).toBeDefined();
      expect(controller['renderer']).toBeDefined();
      expect(controller['uiManager']).toBeDefined();
      expect(controller['storage']).toBeDefined();
    });

    it('应该初始化游戏状态为NOT_STARTED', () => {
      expect(controller['model'].state).toBe(GameState.NOT_STARTED);
    });
  });

  describe('startGame', () => {
    it('应该将游戏状态设置为PLAYING', () => {
      controller.startGame();
      expect(controller['model'].state).toBe(GameState.PLAYING);
    });

    it('应该启动游戏循环', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      controller.startGame();
      expect(rafSpy).toHaveBeenCalled();
    });

    it('应该更新UI按钮状态', () => {
      controller.startGame();
      const startButton = document.getElementById('startButton') as HTMLElement;
      const pauseButton = document.getElementById('pauseButton') as HTMLElement;
      
      expect(startButton.style.display).toBe('none');
      expect(pauseButton.style.display).toBe('block');
    });
  });

  describe('handleKeyPress', () => {
    beforeEach(() => {
      controller.startGame();
    });

    it('应该处理方向键 - ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.UP);
    });

    it('应该处理方向键 - ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.DOWN);
    });

    it('应该处理方向键 - ArrowLeft', () => {
      // 蛇初始方向是RIGHT，不能直接向LEFT（反向）
      // 测试向LEFT输入被正确忽略
      const initialDirection = controller['model'].snake.nextDirection;
      const event = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      controller.handleKeyPress(event);
      // 方向应该保持不变（因为LEFT是RIGHT的反方向）
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });

    it('应该处理方向键 - ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.RIGHT);
    });

    it('应该处理WASD键 - W', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyW' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.UP);
    });

    it('应该处理WASD键 - S', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyS' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.DOWN);
    });

    it('应该处理WASD键 - A', () => {
      // 蛇初始方向是RIGHT，不能直接向LEFT（反向）
      // 测试向LEFT输入被正确忽略
      const initialDirection = controller['model'].snake.nextDirection;
      const event = new KeyboardEvent('keydown', { code: 'KeyA' });
      controller.handleKeyPress(event);
      // 方向应该保持不变（因为LEFT是RIGHT的反方向）
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });

    it('应该处理WASD键 - D', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyD' });
      controller.handleKeyPress(event);
      expect(controller['model'].snake.nextDirection).toBe(Direction.RIGHT);
    });

    it('应该处理空格键切换暂停', () => {
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      const initialState = controller['model'].state;
      controller.handleKeyPress(event);
      expect(controller['model'].state).not.toBe(initialState);
    });

    it('暂停时应该忽略方向键输入', () => {
      // 先暂停游戏
      controller.togglePause();
      expect(controller['model'].state).toBe(GameState.PAUSED);
      
      // 记录当前方向
      const initialDirection = controller['model'].snake.nextDirection;
      
      // 尝试改变方向
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      controller.handleKeyPress(event);
      
      // 方向应该保持不变
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });
  });

  describe('handleTouch', () => {
    beforeEach(() => {
      controller.startGame();
    });

    it('应该识别向右滑动', () => {
      controller.handleTouch(100, 100, 200, 100);
      expect(controller['model'].snake.nextDirection).toBe(Direction.RIGHT);
    });

    it('应该识别向左滑动', () => {
      // 蛇初始方向是RIGHT，不能直接向LEFT（反向）
      // 测试向LEFT输入被正确忽略
      const initialDirection = controller['model'].snake.nextDirection;
      controller.handleTouch(200, 100, 100, 100);
      // 方向应该保持不变（因为LEFT是RIGHT的反方向）
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });

    it('应该识别向下滑动', () => {
      controller.handleTouch(100, 100, 100, 200);
      expect(controller['model'].snake.nextDirection).toBe(Direction.DOWN);
    });

    it('应该识别向上滑动', () => {
      controller.handleTouch(100, 200, 100, 100);
      expect(controller['model'].snake.nextDirection).toBe(Direction.UP);
    });

    it('应该忽略小于阈值的滑动', () => {
      const initialDirection = controller['model'].snake.nextDirection;
      controller.handleTouch(100, 100, 120, 100); // 只滑动20像素
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });
  });

  describe('togglePause', () => {
    beforeEach(() => {
      controller.startGame();
    });

    it('应该从PLAYING切换到PAUSED', () => {
      expect(controller['model'].state).toBe(GameState.PLAYING);
      controller.togglePause();
      expect(controller['model'].state).toBe(GameState.PAUSED);
    });

    it('应该从PAUSED切换到PLAYING', () => {
      controller.togglePause(); // 先暂停
      expect(controller['model'].state).toBe(GameState.PAUSED);
      controller.togglePause(); // 再恢复
      expect(controller['model'].state).toBe(GameState.PLAYING);
    });

    it('暂停时应该更新按钮文本', () => {
      controller.togglePause();
      const pauseButton = document.getElementById('pauseButton') as HTMLElement;
      expect(pauseButton.textContent).toBe('继续');
    });

    it('恢复时应该更新按钮文本', () => {
      controller.togglePause(); // 暂停
      controller.togglePause(); // 恢复
      const pauseButton = document.getElementById('pauseButton') as HTMLElement;
      expect(pauseButton.textContent).toBe('暂停');
    });
  });

  describe('changeSpeed', () => {
    it('应该改变游戏速度为SLOW', () => {
      controller.changeSpeed(GameSpeed.SLOW);
      expect(controller['model'].speed).toBe(GameSpeed.SLOW);
    });

    it('应该改变游戏速度为MEDIUM', () => {
      controller.changeSpeed(GameSpeed.MEDIUM);
      expect(controller['model'].speed).toBe(GameSpeed.MEDIUM);
    });

    it('应该改变游戏速度为FAST', () => {
      controller.changeSpeed(GameSpeed.FAST);
      expect(controller['model'].speed).toBe(GameSpeed.FAST);
    });

    it('应该更新UI速度选择器', () => {
      controller.changeSpeed(GameSpeed.FAST);
      const fastButton = document.querySelector('[data-speed="fast"]') as HTMLElement;
      expect(fastButton.classList.contains('active')).toBe(true);
    });
  });

  describe('restart', () => {
    it('应该重置游戏状态', () => {
      controller.startGame();
      
      // 修改一些状态
      controller['model'].score = 100;
      
      // 重新开始
      controller.restart();
      
      // 分数应该重置为0
      expect(controller['model'].score).toBe(0);
      expect(controller['model'].state).toBe(GameState.PLAYING);
    });

    it('应该停止旧的游戏循环并启动新的', () => {
      controller.startGame();
      const oldLoopId = controller['gameLoopId'];
      
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      controller.restart();
      
      expect(rafSpy).toHaveBeenCalled();
    });
  });

  describe('窗口失焦自动暂停', () => {
    it('游戏进行中时窗口失焦应该自动暂停', () => {
      controller.startGame();
      expect(controller['model'].state).toBe(GameState.PLAYING);
      
      // 触发窗口失焦事件
      window.dispatchEvent(new Event('blur'));
      
      expect(controller['model'].state).toBe(GameState.PAUSED);
    });

    it('游戏未开始时窗口失焦不应该改变状态', () => {
      expect(controller['model'].state).toBe(GameState.NOT_STARTED);
      
      // 触发窗口失焦事件
      window.dispatchEvent(new Event('blur'));
      
      expect(controller['model'].state).toBe(GameState.NOT_STARTED);
    });
  });

  describe('内存优化 - destroy方法', () => {
    it('应该停止游戏循环', () => {
      controller.startGame();
      expect(controller['gameLoopId']).not.toBeNull();
      
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      controller.destroy();
      
      expect(cancelSpy).toHaveBeenCalled();
      expect(controller['gameLoopId']).toBeNull();
    });

    it('应该移除键盘事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      controller.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('应该移除窗口失焦事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      controller.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    });

    it('应该移除Canvas触摸事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');
      controller.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('应该调用UIManager的destroy方法', () => {
      const uiManagerDestroySpy = vi.spyOn(controller['uiManager'], 'destroy');
      controller.destroy();
      
      expect(uiManagerDestroySpy).toHaveBeenCalled();
    });

    it('销毁后不应该响应键盘事件', () => {
      controller.startGame();
      controller.destroy();
      
      const initialDirection = controller['model'].snake.nextDirection;
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      document.dispatchEvent(event);
      
      // 方向不应该改变，因为事件监听器已被移除
      expect(controller['model'].snake.nextDirection).toBe(initialDirection);
    });
  });
});
