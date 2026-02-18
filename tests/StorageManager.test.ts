/**
 * StorageManager类的单元测试
 * Unit tests for StorageManager class
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageManager } from '../src/StorageManager';
import { CONFIG } from '../src/types';

describe('StorageManager类', () => {
  let storageManager: StorageManager;
  const testKey = 'test-snake-game-leaderboard';

  beforeEach(() => {
    storageManager = new StorageManager(testKey);
    // 清空localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // 清理测试数据
    localStorage.clear();
  });

  describe('构造函数', () => {
    it('应该使用默认storageKey创建实例', () => {
      const manager = new StorageManager();
      expect(manager).toBeDefined();
    });

    it('应该使用自定义storageKey创建实例', () => {
      const manager = new StorageManager('custom-key');
      expect(manager).toBeDefined();
    });
  });

  describe('isStorageAvailable方法', () => {
    it('应该检测到localStorage可用', () => {
      const available = storageManager.isStorageAvailable();
      expect(available).toBe(true);
    });
  });

  describe('getLeaderboard方法', () => {
    it('应该返回空数组当localStorage为空时', () => {
      const leaderboard = storageManager.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });

    it('应该从localStorage读取排行榜数据', () => {
      const testData = {
        entries: [
          { score: 100, date: '2024-01-01T00:00:00.000Z' },
          { score: 50, date: '2024-01-02T00:00:00.000Z' }
        ]
      };
      localStorage.setItem(testKey, JSON.stringify(testData));

      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toEqual(testData.entries);
    });

    it('应该返回空数组当数据格式无效时', () => {
      localStorage.setItem(testKey, 'invalid json');
      
      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toEqual([]);
    });

    it('应该过滤掉格式不正确的条目', () => {
      const testData = {
        entries: [
          { score: 100, date: '2024-01-01T00:00:00.000Z' },
          { score: 'invalid', date: '2024-01-02T00:00:00.000Z' }, // 无效分数
          { score: 50 }, // 缺少日期
          { score: 30, date: '2024-01-03T00:00:00.000Z' }
        ]
      };
      localStorage.setItem(testKey, JSON.stringify(testData));

      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0]).toEqual({ score: 100, date: '2024-01-01T00:00:00.000Z' });
      expect(leaderboard[1]).toEqual({ score: 30, date: '2024-01-03T00:00:00.000Z' });
    });

    it('应该返回空数组当entries不是数组时', () => {
      const testData = {
        entries: 'not an array'
      };
      localStorage.setItem(testKey, JSON.stringify(testData));

      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toEqual([]);
    });
  });

  describe('saveScore方法', () => {
    it('应该保存分数到空排行榜', () => {
      const result = storageManager.saveScore(100);
      
      expect(result).toBe(true);
      
      const leaderboard = storageManager.getLeaderboard();
      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].score).toBe(100);
    });

    it('应该保存分数并按降序排列', () => {
      storageManager.saveScore(50);
      storageManager.saveScore(100);
      storageManager.saveScore(75);
      
      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard[0].score).toBe(100);
      expect(leaderboard[1].score).toBe(75);
      expect(leaderboard[2].score).toBe(50);
    });

    it('应该只保留前10名', () => {
      // 保存11个分数
      for (let i = 0; i < 11; i++) {
        storageManager.saveScore((11 - i) * 10);
      }
      
      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toHaveLength(CONFIG.LEADERBOARD_SIZE);
      expect(leaderboard[0].score).toBe(110);
      expect(leaderboard[9].score).toBe(20);
    });

    it('应该返回true当分数进入前10名', () => {
      // 填满排行榜
      for (let i = 0; i < 10; i++) {
        storageManager.saveScore((10 - i) * 10);
      }
      
      // 保存一个高分
      const result = storageManager.saveScore(150);
      
      expect(result).toBe(true);
    });

    it('应该返回false当分数未进入前10名', () => {
      // 填满排行榜
      for (let i = 0; i < 10; i++) {
        storageManager.saveScore((10 - i) * 10);
      }
      
      // 保存一个低分
      const result = storageManager.saveScore(5);
      
      expect(result).toBe(false);
    });

    it('应该保存日期时间信息', () => {
      const beforeSave = new Date();
      storageManager.saveScore(100);
      const afterSave = new Date();
      
      const leaderboard = storageManager.getLeaderboard();
      const savedDate = new Date(leaderboard[0].date);
      
      expect(savedDate.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedDate.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('应该保存ISO 8601格式的日期', () => {
      storageManager.saveScore(100);
      
      const leaderboard = storageManager.getLeaderboard();
      const dateString = leaderboard[0].date;
      
      // 验证ISO 8601格式
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('clearLeaderboard方法', () => {
    it('应该清空排行榜', () => {
      storageManager.saveScore(100);
      storageManager.saveScore(50);
      
      storageManager.clearLeaderboard();
      
      const leaderboard = storageManager.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });

    it('应该在排行榜为空时不报错', () => {
      expect(() => {
        storageManager.clearLeaderboard();
      }).not.toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该在localStorage操作失败时返回空数组', () => {
      // 模拟localStorage.getItem抛出错误
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage error');
      };

      const leaderboard = storageManager.getLeaderboard();
      
      expect(leaderboard).toEqual([]);
      
      // 恢复原始方法
      localStorage.getItem = originalGetItem;
    });

    it('应该在清空失败时不抛出错误', () => {
      // 模拟localStorage.removeItem抛出错误
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = () => {
        throw new Error('Storage error');
      };

      expect(() => {
        storageManager.clearLeaderboard();
      }).not.toThrow();
      
      // 恢复原始方法
      localStorage.removeItem = originalRemoveItem;
    });
  });
});
