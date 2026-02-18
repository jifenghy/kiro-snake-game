/**
 * 贪吃蛇游戏主入口文件
 * Main entry point for the Snake Game
 * 
 * 需求：所有需求
 * 任务：14.2 创建main.ts入口文件
 */

import { GameController } from './GameController';
import { CONFIG } from './types';

/**
 * 设置Canvas的实际尺寸以匹配CSS尺寸
 * 这确保了响应式设计的正确渲染
 * 需求 9.4: 保持纵横比
 */
function resizeCanvas(canvas: HTMLCanvasElement): void {
  // 获取CSS计算后的尺寸
  const rect = canvas.getBoundingClientRect();
  const displayWidth = rect.width;
  const displayHeight = rect.height;
  
  // 设置Canvas的内部分辨率以匹配显示尺寸
  // 使用devicePixelRatio确保在高DPI屏幕上清晰显示
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  
  // 缩放上下文以匹配设备像素比
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}

/**
 * 绘制初始欢迎画面
 */
function drawWelcomeScreen(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const rect = canvas.getBoundingClientRect();
  
  // 清空画布
  ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
  ctx.fillRect(0, 0, rect.width, rect.height);
  
  // 绘制欢迎文本
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('贪吃蛇游戏', rect.width / 2, rect.height / 2 - 30);
  
  ctx.font = '16px Arial';
  ctx.fillText('点击"开始游戏"按钮开始', rect.width / 2, rect.height / 2 + 10);
}

// 全局游戏控制器实例
let gameController: GameController | null = null;

/**
 * 初始化游戏
 * 需求：所有需求
 */
function initGame(): void {
  console.log('贪吃蛇游戏初始化...');
  
  // 获取Canvas元素
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('无法找到Canvas元素');
    return;
  }
  
  // 初始化Canvas尺寸
  resizeCanvas(canvas);
  
  // 验证Canvas上下文
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('无法获取Canvas上下文');
    return;
  }
  
  // 绘制初始欢迎画面
  drawWelcomeScreen(canvas);
  
  // 初始化GameController
  // GameController会自动初始化UIManager、GameModel、Renderer和StorageManager
  try {
    gameController = new GameController(
      canvas,
      CONFIG.GRID_WIDTH,
      CONFIG.GRID_HEIGHT,
      CONFIG.CELL_SIZE
    );
    
    console.log('游戏控制器初始化成功');
  } catch (error) {
    console.error('游戏控制器初始化失败:', error);
    return;
  }
  
  // 监听窗口大小变化，重新调整Canvas尺寸
  // 需求 9.4: 当浏览器窗口大小改变时，保持游戏区域的纵横比
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    // 使用防抖避免频繁调整
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      resizeCanvas(canvas);
      
      // 如果游戏未开始，重新绘制欢迎画面
      if (gameController && gameController['model'].state === 'NOT_STARTED') {
        drawWelcomeScreen(canvas);
      }
    }, 250);
  });
  
  console.log('游戏初始化完成，准备就绪');
}

// 等待DOM加载完成后初始化游戏
// 需求：所有需求
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM已加载，开始初始化游戏');
  initGame();
});

// 页面卸载时清理资源
// 需求：5.4 - 内存优化
window.addEventListener('beforeunload', () => {
  if (gameController) {
    gameController.destroy();
    gameController = null;
  }
});
