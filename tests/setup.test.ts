import { describe, it, expect } from 'vitest';

describe('项目设置', () => {
  it('测试框架应该正常工作', () => {
    expect(true).toBe(true);
  });

  it('fast-check应该可用', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
  });
});
