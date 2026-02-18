/**
 * UIManager类 - 管理所有UI元素和事件绑定
 * UIManager class - manages all UI elements and event bindings
 */

import { GameSpeed, LeaderboardEntry } from './types';

export class UIManager {
  // UI元素引用
  private scoreDisplay: HTMLElement;
  private highScoreDisplay: HTMLElement;
  private speedButtons: NodeListOf<HTMLElement>;
  private pauseButton: HTMLElement;
  private startButton: HTMLElement;
  private restartButton: HTMLElement;
  private leaderboardButton: HTMLElement;
  private leaderboardModal: HTMLElement;
  private leaderboardList: HTMLElement;
  private closeButton: HTMLElement;
  private gameAnnouncements: HTMLElement; // 屏幕阅读器公告区域

  // 存储事件处理器引用，用于清理
  private boundStartHandler?: () => void;
  private boundPauseHandler?: () => void;
  private boundRestartHandler?: () => void;
  private boundSpeedHandlers: Map<HTMLElement, () => void> = new Map();
  private boundLeaderboardHandler?: () => void;
  private boundCloseHandler?: () => void;
  private boundCloseKeyHandler?: (event: KeyboardEvent) => void;
  private boundModalClickHandler?: (event: MouseEvent) => void;
  private boundEscKeyHandler?: (event: KeyboardEvent) => void;

  constructor() {
    // 获取所有UI元素引用
    this.scoreDisplay = this.getElement('currentScore');
    this.highScoreDisplay = this.getElement('highScore');
    this.speedButtons = document.querySelectorAll('.speed-btn');
    this.pauseButton = this.getElement('pauseButton');
    this.startButton = this.getElement('startButton');
    this.restartButton = this.getElement('restartButton');
    this.leaderboardButton = this.getElement('leaderboardButton');
    this.leaderboardModal = this.getElement('leaderboardModal');
    this.leaderboardList = this.getElement('leaderboardList');
    this.closeButton = this.leaderboardModal.querySelector('.close') as HTMLElement;
    this.gameAnnouncements = this.getElement('gameAnnouncements');

    if (!this.closeButton) {
      throw new Error('Close button not found in leaderboard modal');
    }
  }

  /**
   * 辅助方法：获取元素并检查是否存在
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element;
  }

  /**
   * 更新分数显示
   * @param score 当前分数
   */
  updateScore(score: number): void {
    const oldScore = parseInt(this.scoreDisplay.textContent || '0');
    this.scoreDisplay.textContent = score.toString();
    
    // 添加分数增加动画 (需求 7.6)
    if (score > oldScore) {
      this.scoreDisplay.classList.remove('score-increase');
      // 强制重排以重新触发动画
      void this.scoreDisplay.offsetWidth;
      this.scoreDisplay.classList.add('score-increase');
      
      // 动画结束后移除类
      setTimeout(() => {
        this.scoreDisplay.classList.remove('score-increase');
      }, 300);
    }
  }

  /**
   * 更新最高分显示
   * @param highScore 最高分
   */
  updateHighScore(highScore: number): void {
    this.highScoreDisplay.textContent = highScore.toString();
  }

  /**
   * 更新速度选择器的激活状态
   * @param speed 当前游戏速度
   */
  updateSpeedSelector(speed: GameSpeed): void {
    const speedMap: Record<GameSpeed, string> = {
      [GameSpeed.SLOW]: 'slow',
      [GameSpeed.MEDIUM]: 'medium',
      [GameSpeed.FAST]: 'fast'
    };

    const targetSpeed = speedMap[speed];

    this.speedButtons.forEach(button => {
      const buttonSpeed = button.getAttribute('data-speed');
      if (buttonSpeed === targetSpeed) {
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /**
   * 向屏幕阅读器公告消息 (需求 6.5)
   * @param message 要公告的消息
   */
  announceToScreenReader(message: string): void {
    // 清空现有内容
    this.gameAnnouncements.textContent = '';
    
    // 使用setTimeout确保屏幕阅读器检测到变化
    setTimeout(() => {
      this.gameAnnouncements.textContent = message;
    }, 100);
  }

  /**
   * 显示开始按钮
   */
  showStartButton(): void {
    this.startButton.style.display = 'block';
  }

  /**
   * 隐藏开始按钮
   */
  hideStartButton(): void {
    this.startButton.style.display = 'none';
  }

  /**
   * 显示暂停按钮
   */
  showPauseButton(): void {
    this.pauseButton.style.display = 'block';
  }

  /**
   * 隐藏暂停按钮
   */
  hidePauseButton(): void {
    this.pauseButton.style.display = 'none';
  }

  /**
   * 显示重新开始按钮
   */
  showRestartButton(): void {
    this.restartButton.style.display = 'block';
  }

  /**
   * 隐藏重新开始按钮
   */
  hideRestartButton(): void {
    this.restartButton.style.display = 'none';
  }

  /**
   * 更新暂停按钮文本
   * @param isPaused 是否暂停
   */
  updatePauseButtonText(isPaused: boolean): void {
    this.pauseButton.textContent = isPaused ? '继续' : '暂停';
  }

  /**
   * 显示排行榜
   * @param entries 排行榜条目数组
   */
  showLeaderboard(entries: LeaderboardEntry[]): void {
    // 清空现有内容
    this.leaderboardList.innerHTML = '';

    if (entries.length === 0) {
      // 显示空排行榜提示
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-leaderboard';
      emptyMessage.textContent = '暂无排行榜记录';
      this.leaderboardList.appendChild(emptyMessage);
    } else {
      // 创建排行榜表格
      const table = document.createElement('table');
      table.className = 'leaderboard-table';

      // 创建表头
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>排名</th>
          <th>分数</th>
          <th>日期时间</th>
        </tr>
      `;
      table.appendChild(thead);

      // 创建表体
      const tbody = document.createElement('tbody');
      entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        const date = new Date(entry.date);
        const formattedDate = this.formatDate(date);

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.score}</td>
          <td>${formattedDate}</td>
        `;
        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      this.leaderboardList.appendChild(table);
    }

    // 显示模态框
    this.leaderboardModal.style.display = 'block';
    
    // 焦点管理：将焦点移到关闭按钮 (需求 6.5)
    setTimeout(() => {
      this.closeButton.focus();
    }, 100);
  }

  /**
   * 隐藏排行榜
   */
  hideLeaderboard(): void {
    this.leaderboardModal.style.display = 'none';
    
    // 焦点管理：将焦点返回到排行榜按钮 (需求 6.5)
    this.leaderboardButton.focus();
  }

  /**
   * 格式化日期时间
   * @param date Date对象
   * @returns 格式化的日期时间字符串
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 绑定所有UI事件
   * @param callbacks 事件回调函数对象
   */
  bindEvents(callbacks: {
    onStart: () => void;
    onPause: () => void;
    onRestart: () => void;
    onSpeedChange: (speed: GameSpeed) => void;
    onShowLeaderboard: () => void;
  }): void {
    // 绑定开始按钮
    this.boundStartHandler = () => {
      this.addButtonClickFeedback(this.startButton);
      callbacks.onStart();
    };
    this.startButton.addEventListener('click', this.boundStartHandler);

    // 绑定暂停按钮
    this.boundPauseHandler = () => {
      this.addButtonClickFeedback(this.pauseButton);
      callbacks.onPause();
    };
    this.pauseButton.addEventListener('click', this.boundPauseHandler);

    // 绑定重新开始按钮
    this.boundRestartHandler = () => {
      this.addButtonClickFeedback(this.restartButton);
      callbacks.onRestart();
    };
    this.restartButton.addEventListener('click', this.boundRestartHandler);

    // 绑定速度按钮
    this.speedButtons.forEach(button => {
      const handler = () => {
        this.addButtonClickFeedback(button as HTMLElement);
        
        const speedAttr = button.getAttribute('data-speed');
        let speed: GameSpeed;

        switch (speedAttr) {
          case 'slow':
            speed = GameSpeed.SLOW;
            break;
          case 'medium':
            speed = GameSpeed.MEDIUM;
            break;
          case 'fast':
            speed = GameSpeed.FAST;
            break;
          default:
            return; // 忽略无效的速度值
        }

        callbacks.onSpeedChange(speed);
      };
      
      this.boundSpeedHandlers.set(button as HTMLElement, handler);
      button.addEventListener('click', handler);
    });

    // 绑定排行榜按钮
    this.boundLeaderboardHandler = () => {
      this.addButtonClickFeedback(this.leaderboardButton);
      callbacks.onShowLeaderboard();
    };
    this.leaderboardButton.addEventListener('click', this.boundLeaderboardHandler);

    // 绑定关闭按钮
    this.boundCloseHandler = () => {
      this.hideLeaderboard();
    };
    this.closeButton.addEventListener('click', this.boundCloseHandler);
    
    // 确保关闭按钮可以通过键盘访问 (需求 6.5)
    this.boundCloseKeyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.hideLeaderboard();
      }
    };
    this.closeButton.addEventListener('keydown', this.boundCloseKeyHandler);

    // 点击模态框外部关闭
    this.boundModalClickHandler = (event: MouseEvent) => {
      if (event.target === this.leaderboardModal) {
        this.hideLeaderboard();
      }
    };
    this.leaderboardModal.addEventListener('click', this.boundModalClickHandler);
    
    // ESC键关闭模态框 (需求 6.5)
    this.boundEscKeyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.leaderboardModal.style.display === 'block') {
        this.hideLeaderboard();
      }
    };
    document.addEventListener('keydown', this.boundEscKeyHandler);
  }

  /**
   * 添加按钮点击反馈动画 (需求 7.6)
   * @param button 按钮元素
   */
  private addButtonClickFeedback(button: HTMLElement): void {
    button.classList.remove('btn-clicked');
    // 强制重排以重新触发动画
    void button.offsetWidth;
    button.classList.add('btn-clicked');
    
    // 动画结束后移除类
    setTimeout(() => {
      button.classList.remove('btn-clicked');
    }, 200);
  }

  /**
   * 添加游戏开始动画 (需求 7.6)
   * @param canvas Canvas元素
   */
  addGameStartAnimation(canvas: HTMLElement): void {
    canvas.classList.remove('game-start-animation');
    // 强制重排以重新触发动画
    void canvas.offsetWidth;
    canvas.classList.add('game-start-animation');
    
    // 动画结束后移除类
    setTimeout(() => {
      canvas.classList.remove('game-start-animation');
    }, 500);
  }

  /**
   * 添加游戏结束动画 (需求 7.6)
   * @param canvas Canvas元素
   */
  addGameOverAnimation(canvas: HTMLElement): void {
    canvas.classList.remove('game-over-animation');
    // 强制重排以重新触发动画
    void canvas.offsetWidth;
    canvas.classList.add('game-over-animation');
    
    // 动画结束后移除类
    setTimeout(() => {
      canvas.classList.remove('game-over-animation');
    }, 500);
  }
  /**
   * 清理事件监听器
   * 需求：5.4 - 内存优化
   */
  destroy(): void {
    // 移除按钮事件监听器
    if (this.boundStartHandler) {
      this.startButton.removeEventListener('click', this.boundStartHandler);
    }
    if (this.boundPauseHandler) {
      this.pauseButton.removeEventListener('click', this.boundPauseHandler);
    }
    if (this.boundRestartHandler) {
      this.restartButton.removeEventListener('click', this.boundRestartHandler);
    }
    if (this.boundLeaderboardHandler) {
      this.leaderboardButton.removeEventListener('click', this.boundLeaderboardHandler);
    }
    if (this.boundCloseHandler) {
      this.closeButton.removeEventListener('click', this.boundCloseHandler);
    }
    if (this.boundCloseKeyHandler) {
      this.closeButton.removeEventListener('keydown', this.boundCloseKeyHandler);
    }
    if (this.boundModalClickHandler) {
      this.leaderboardModal.removeEventListener('click', this.boundModalClickHandler);
    }
    if (this.boundEscKeyHandler) {
      document.removeEventListener('keydown', this.boundEscKeyHandler);
    }

    // 移除速度按钮的事件监听器
    this.boundSpeedHandlers.forEach((handler, button) => {
      button.removeEventListener('click', handler);
    });
    this.boundSpeedHandlers.clear();
  }
}
