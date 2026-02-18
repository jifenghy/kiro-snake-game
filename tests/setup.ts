/**
 * Vitest setup file
 * Mocks Canvas API for testing
 */

import { beforeAll } from 'vitest';

// Mock Canvas 2D Context
beforeAll(() => {
  // Create a mock 2D context
  const mockContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: () => ({ width: 0 }),
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    rect: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    transform: () => {},
    setTransform: () => {},
    drawImage: () => {},
    createImageData: () => ({ data: [], width: 0, height: 0 }),
    getImageData: () => ({ data: [], width: 0, height: 0 }),
    putImageData: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {}
    }),
    createRadialGradient: () => ({
      addColorStop: () => {}
    }),
    createPattern: () => null,
  };

  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = function(contextType: string) {
    if (contextType === '2d') {
      return mockContext as any;
    }
    return null;
  };

  // Mock OffscreenCanvas if needed
  if (typeof OffscreenCanvas === 'undefined') {
    (global as any).OffscreenCanvas = class OffscreenCanvas {
      width: number;
      height: number;
      
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
      
      getContext(contextType: string) {
        if (contextType === '2d') {
          return mockContext as any;
        }
        return null;
      }
    };
  }
});
