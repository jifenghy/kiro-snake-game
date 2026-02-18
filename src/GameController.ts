/**
 * GameController类 - 游戏控制器，协调所有组件
 * GameController class - coordinates all game components
 * 
 * 需求：1.2-1.3, 2.5-2.6, 3.1-3.6, 6.2, 6.4-6.7
 */

import { GameModel } from './GameModel';
import { Renderer } from './Renderer';
import { UIManager } from './UIManager';
import { StorageManager } from './StorageManager';
import { Direction, GameState, GameSpeed } from './types';

export class GameController {
  private model: GameModel;
  private renderer: Renderer;
  private uiManager: UIManager;
  private storage: StorageManager;
  private gameLoopId: number | null = null;
  private lastUpdateTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private lastAnnouncedScore: number = 0; // 用于跟踪上次公告的分数
  
  // 存储绑定的事件处理器引用，用于清理
  private boundKeyPressHandler: (e: KeyboardEvent) => void;
  private boundWindowBlurHandler: () => void;
  private boundTouchStartHandler: (e: TouchEvent) => void;
  private boundTouchEndHandler: (e: TouchEvent) => void;

  /**
   * 构造函数 - 初始化所有组件
   * @param canvas Canvas元素
   * @param gridWidth 游戏区域宽度（格子数）
   * @param gridHeight 游戏区域高度（格子数）
   * @param cellSize 每个格子的像素大小
   */
  constructor(
    canvas: HTMLCanvasElement,
    gridWidth: number,
    gridHeight: number,
    cellSize: number
  ) {
    // 初始化所有组件
    this.model = new GameModel(gridWidth, gridHeight);
    this.renderer = new Renderer(canvas, cellSize);
    this.uiManager = new UIManager();
    this.storage = new StorageManager();

    // 绑定事件处理器并保存引用
    this.boundKeyPressHandler = (e: KeyboardEvent) => this.handleKeyPress(e);
    this.boundWindowBlurHandler = () => this.handleWindowBlur();
    this.boundTouchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
    this.boundTouchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);

    // 绑定事件监听器
    this.setupEventListeners();
    
    // 初始化UI状态
    this.updateUI();
  }

  /**
   * 设置所有事件监听器
   */
  private setupEventListeners(): void {
    // 绑定UI事件
    this.uiManager.bindEvents({
      onStart: () => this.startGame(),
      onPause: () => this.togglePause(),
      onRestart: () => this.restart(),
      onSpeedChange: (speed: GameSpeed) => this.changeSpeed(speed),
      onShowLeaderboard: () => this.showLeaderboard()
    });

    // 绑定键盘事件
    document.addEventListener('keydown', this.boundKeyPressHandler);

    // 绑定触摸事件
    const canvas = this.renderer.canvas;
    canvas.addEventListener('touchstart', this.boundTouchStartHandler, { passive: false });
    canvas.addEventListener('touchend', this.boundTouchEndHandler, { passive: false });
    
    // 绑定虚拟方向键事件
    this.setupVirtualDPad();

    // 绑定窗口失焦事件（需求6.7）
    window.addEventListener('blur', this.boundWindowBlurHandler);
  }
  
  /**
   * 设置虚拟方向键（移动端）
   */
  private setupVirtualDPad(): void {
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    
    dpadButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (this.model.state !== GameState.PLAYING) {
          return;
        }
        
        const direction = (button as HTMLElement).getAttribute('data-direction');
        
        switch (direction) {
          case 'up':
            this.model.snake.changeDirection(Direction.UP);
            break;
          case 'down':
            this.model.snake.changeDirection(Direction.DOWN);
            break;
          case 'left':
            this.model.snake.changeDirection(Direction.LEFT);
            break;
          case 'right':
            this.model.snake.changeDirection(Direction.RIGHT);
            break;
        }
      });
      
      // 添加触摸反馈
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        (button as HTMLElement).style.transform = 'scale(0.95)';
      });
      
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        const btn = button as HTMLElement;
        const isVertical = btn.classList.contains('dpad-up') || btn.classList.contains('dpad-down');
        const isHorizontal = btn.classList.contains('dpad-left') || btn.classList.contains('dpad-right');
        
        if (isVertical) {
          btn.style.transform = 'translateX(-50%)';
        } else if (isHorizontal) {
          btn.style.transform = 'translateY(-50%)';
        }
      });
    });
  }

  /**
   * 开始新游戏
   * 需求：6.2, 7.6
   */
  startGame(): void {
    // 初始化游戏状态
    this.model.initGame();
    this.model.state = GameState.PLAYING;
    
    // 添加游戏开始动画 (需求 7.6)
    this.uiManager.addGameStartAnimation(this.renderer.canvas);
    
    // 屏幕阅读器公告 (需求 6.5)
    this.uiManager.announceToScreenReader('游戏开始，当前分数0分');
    
    // 更新UI
    this.uiManager.hideStartButton();
    this.uiManager.showPauseButton();
    this.uiManager.hideRestartButton();
    this.updateUI();

    // 启动游戏循环
    this.lastUpdateTime = performance.now();
    this.gameLoopId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  /**
   * 游戏循环 - 使用requestAnimationFrame（优化版）
   * 需求：1.2, 2.6
   * @param timestamp 当前时间戳
   */
  gameLoop(timestamp: number): void {
    // 优化：使用高精度时间戳计算
    const deltaTime = timestamp - this.lastUpdateTime;
    
    // 根据游戏速度计算更新间隔（毫秒）
    const updateInterval = 1000 / this.model.speed;

    // 如果时间间隔足够，更新游戏状态
    if (deltaTime >= updateInterval) {
      // 优化：只更新必要的时间差，避免累积误差
      this.lastUpdateTime = timestamp - (deltaTime % updateInterval);
      
      this.model.update();

      // 更新UI和渲染
      this.updateUI();
      
      // 检查分数是否变化，如果变化则公告 (需求 6.5)
      const currentScore = this.model.getScore();
      if (currentScore > this.lastAnnouncedScore) {
        this.uiManager.announceToScreenReader(`得分！当前分数${currentScore}分`);
        this.lastAnnouncedScore = currentScore;
      }
    }

    // 渲染当前帧（优化：render方法内部会检查状态变化）
    this.renderer.render(this.model);

    // 检查游戏是否结束
    if (this.model.state === GameState.GAME_OVER) {
      this.endGame();
      return;
    }

    // 如果游戏不在进行中，停止循环
    if (this.model.state !== GameState.PLAYING) {
      this.gameLoopId = null;
      return;
    }

    // 继续游戏循环
    this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * 处理键盘输入
   * 需求：1.3, 3.1, 6.5, 6.6
   * @param event 键盘事件
   */
  handleKeyPress(event: KeyboardEvent): void {
    // 空格键处理暂停
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.model.state === GameState.PLAYING || this.model.state === GameState.PAUSED) {
        this.togglePause();
      }
      return;
    }

    // 如果游戏暂停，忽略方向键输入（需求3.5）
    if (this.model.state === GameState.PAUSED) {
      return;
    }

    // 只在游戏进行中处理方向键
    if (this.model.state !== GameState.PLAYING) {
      return;
    }

    // 处理方向键和WASD
    let direction: Direction | null = null;

    switch (event.code) {
      // 方向键
      case 'ArrowUp':
        direction = Direction.UP;
        event.preventDefault();
        break;
      case 'ArrowDown':
        direction = Direction.DOWN;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        direction = Direction.LEFT;
        event.preventDefault();
        break;
      case 'ArrowRight':
        direction = Direction.RIGHT;
        event.preventDefault();
        break;
      
      // WASD键
      case 'KeyW':
        direction = Direction.UP;
        break;
      case 'KeyS':
        direction = Direction.DOWN;
        break;
      case 'KeyA':
        direction = Direction.LEFT;
        break;
      case 'KeyD':
        direction = Direction.RIGHT;
        break;
    }

    // 如果是有效的方向输入，改变蛇的方向
    if (direction !== null) {
      this.model.snake.changeDirection(direction);
    }
  }

  /**
   * 处理触摸开始事件
   * @param event 触摸事件
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  /**
   * 处理触摸结束事件
   * 需求：7.5
   * @param event 触摸事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    this.handleTouch(this.touchStartX, this.touchStartY, endX, endY);
  }

  /**
   * 处理触摸滑动，识别方向
   * 需求：7.5
   * @param startX 起始X坐标
   * @param startY 起始Y坐标
   * @param endX 结束X坐标
   * @param endY 结束Y坐标
   */
  handleTouch(startX: number, startY: number, endX: number, endY: number): void {
    // 只在游戏进行中处理触摸
    if (this.model.state !== GameState.PLAYING) {
      return;
    }

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // 最小滑动距离阈值
    const minSwipeDistance = 30;

    // 判断是水平滑动还是垂直滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          this.model.snake.changeDirection(Direction.RIGHT);
        } else {
          this.model.snake.changeDirection(Direction.LEFT);
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          this.model.snake.changeDirection(Direction.DOWN);
        } else {
          this.model.snake.changeDirection(Direction.UP);
        }
      }
    }
  }

  /**
   * 切换暂停状态
   * 需求：3.1, 3.4, 3.6
   */
  togglePause(): void {
    if (this.model.state === GameState.PLAYING) {
      // 暂停游戏
      this.model.togglePause();
      this.uiManager.updatePauseButtonText(true);
      
      // 屏幕阅读器公告 (需求 6.5)
      this.uiManager.announceToScreenReader('游戏已暂停');
      
      // 显示暂停提示
      this.renderer.render(this.model);
      this.renderer.showPauseOverlay();
    } else if (this.model.state === GameState.PAUSED) {
      // 恢复游戏
      this.model.togglePause();
      this.uiManager.updatePauseButtonText(false);
      
      // 屏幕阅读器公告 (需求 6.5)
      this.uiManager.announceToScreenReader('游戏继续');
      
      // 重新启动游戏循环
      this.lastUpdateTime = performance.now();
      this.gameLoopId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  /**
   * 改变游戏速度
   * 需求：2.5, 2.6
   * @param speed 新的游戏速度
   */
  changeSpeed(speed: GameSpeed): void {
    this.model.setSpeed(speed);
    this.uiManager.updateSpeedSelector(speed);
    
    // 屏幕阅读器公告 (需求 6.5)
    const speedNames: Record<GameSpeed, string> = {
      [GameSpeed.SLOW]: '慢速',
      [GameSpeed.MEDIUM]: '中速',
      [GameSpeed.FAST]: '快速'
    };
    this.uiManager.announceToScreenReader(`游戏速度已更改为${speedNames[speed]}`);
  }

  /**
   * 结束游戏
   * 需求：1.7, 1.8, 4.4, 5.1, 5.2, 7.6
   */
  endGame(): void {
    // 停止游戏循环
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }

    // 添加游戏结束动画 (需求 7.6)
    this.uiManager.addGameOverAnimation(this.renderer.canvas);

    // 保存分数到排行榜
    const finalScore = this.model.getScore();
    const isTopScore = this.storage.saveScore(finalScore);
    
    // 屏幕阅读器公告 (需求 6.5)
    if (isTopScore) {
      this.uiManager.announceToScreenReader(`游戏结束！最终分数${finalScore}分，恭喜进入排行榜！`);
    } else {
      this.uiManager.announceToScreenReader(`游戏结束！最终分数${finalScore}分`);
    }

    // 更新UI
    this.uiManager.hidePauseButton();
    this.uiManager.showRestartButton();
    
    // 更新最高分显示
    const leaderboard = this.storage.getLeaderboard();
    if (leaderboard.length > 0) {
      this.uiManager.updateHighScore(leaderboard[0].score);
    }

    // 显示游戏结束画面
    this.renderer.render(this.model);
    this.renderer.showGameOver(finalScore);
  }

  /**
   * 重新开始游戏
   * 需求：6.4
   */
  restart(): void {
    // 停止当前游戏循环
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }

    // 重置分数跟踪
    this.lastAnnouncedScore = 0;

    // 重置游戏状态并开始新游戏
    this.startGame();
  }

  /**
   * 处理窗口失焦事件
   * 需求：6.7
   */
  private handleWindowBlur(): void {
    // 如果游戏正在进行中，自动暂停
    if (this.model.state === GameState.PLAYING) {
      this.togglePause();
    }
  }

  /**
   * 显示排行榜
   * 需求：5.5, 5.6, 5.7
   */
  private showLeaderboard(): void {
    const leaderboard = this.storage.getLeaderboard();
    this.uiManager.showLeaderboard(leaderboard);
  }

  /**
   * 更新UI显示
   */
  private updateUI(): void {
    this.uiManager.updateScore(this.model.getScore());
    this.uiManager.updateSpeedSelector(this.model.speed);
    
    // 更新最高分
    const leaderboard = this.storage.getLeaderboard();
    if (leaderboard.length > 0) {
      this.uiManager.updateHighScore(leaderboard[0].score);
    }
  }
  /**
   * 清理资源和事件监听器
   * 需求：5.4 - 内存优化
   */
  destroy(): void {
    // 停止游戏循环
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }

    // 移除事件监听器
    document.removeEventListener('keydown', this.boundKeyPressHandler);
    window.removeEventListener('blur', this.boundWindowBlurHandler);

    // 移除Canvas触摸事件监听器
    const canvas = this.renderer.canvas;
    canvas.removeEventListener('touchstart', this.boundTouchStartHandler);
    canvas.removeEventListener('touchend', this.boundTouchEndHandler);

    // 清理UI管理器
    this.uiManager.destroy();
  }
}
