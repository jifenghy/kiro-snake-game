/**
 * StorageManager类 - 管理排行榜数据的本地存储
 * StorageManager class - manages leaderboard data in local storage
 * 
 * 需求：5.1-5.4, 8.1-8.4
 */

import { LeaderboardEntry, CONFIG } from './types';

export class StorageManager {
  private storageKey: string;

  constructor(storageKey: string = 'snake-game-leaderboard') {
    this.storageKey = storageKey;
  }

  /**
   * 检查localStorage是否可用
   * Check if localStorage is available
   * 需求：8.3
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 获取排行榜数据
   * Get leaderboard data
   * 需求：5.1, 8.2
   */
  getLeaderboard(): LeaderboardEntry[] {
    try {
      if (!this.isStorageAvailable()) {
        return [];
      }

      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      
      // 验证数据格式
      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        return [];
      }

      // 验证每个条目的格式
      const validEntries = parsed.entries.filter((entry: any) => {
        return (
          typeof entry === 'object' &&
          typeof entry.score === 'number' &&
          typeof entry.date === 'string'
        );
      });

      return validEntries;
    } catch (e) {
      console.error('Failed to read leaderboard:', e);
      return [];
    }
  }

  /**
   * 保存分数到排行榜
   * Save score to leaderboard
   * 需求：5.1, 5.2, 5.3, 5.4, 8.1
   * 
   * @param score - 要保存的分数
   * @returns 是否进入前10名
   */
  saveScore(score: number): boolean {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }

      const leaderboard = this.getLeaderboard();
      
      // 创建新条目
      const newEntry: LeaderboardEntry = {
        score,
        date: new Date().toISOString()
      };

      // 添加新条目
      leaderboard.push(newEntry);

      // 按分数降序排列
      leaderboard.sort((a, b) => b.score - a.score);

      // 只保留前10名
      const topEntries = leaderboard.slice(0, CONFIG.LEADERBOARD_SIZE);

      // 保存到localStorage
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({ entries: topEntries })
      );

      // 检查新分数是否进入前10（只有在成功保存后才检查）
      const enteredTop10 = topEntries.some(
        entry => entry.score === score && entry.date === newEntry.date
      );

      return enteredTop10;
    } catch (e) {
      console.error('Failed to save score:', e);
      return false;
    }
  }

  /**
   * 清空排行榜
   * Clear leaderboard
   * 需求：8.4
   */
  clearLeaderboard(): void {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear leaderboard:', e);
    }
  }
}
