# 贪吃蛇游戏

经典的Web贪吃蛇游戏，使用TypeScript和HTML5 Canvas开发。

## 功能特性

- 经典贪吃蛇游戏玩法
- 三种游戏速度（慢速、中速、快速）
- 暂停/继续功能
- 分数系统和排行榜
- 响应式设计，支持桌面和移动设备
- 键盘和触摸控制

## 技术栈

- TypeScript
- HTML5 Canvas
- Vite（构建工具）
- Vitest（测试框架）
- fast-check（属性测试）

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 测试

```bash
npm test
```

### 测试（监听模式）

```bash
npm run test:watch
```

## 项目结构

```
.
├── src/              # 源代码
├── tests/            # 测试文件
├── public/           # 静态资源
├── index.html        # HTML模板
├── styles.css        # 样式文件
├── tsconfig.json     # TypeScript配置
├── vite.config.ts    # Vite配置
└── vitest.config.ts  # Vitest配置
```

## 操作说明

- **方向键 / WASD**: 控制蛇的移动方向
- **空格键**: 暂停/继续游戏
- **速度按钮**: 调整游戏速度
- **开始游戏**: 开始新游戏
- **重新开始**: 游戏结束后重新开始
- **查看排行榜**: 查看历史最高分

## 开发进度

- [x] 项目初始化和基础结构
- [ ] 核心数据结构和类型
- [ ] Snake类实现
- [ ] GameModel类实现
- [ ] StorageManager类实现
- [ ] Renderer类实现
- [ ] UIManager类实现
- [ ] GameController类实现
- [ ] 响应式设计
- [ ] 性能优化

## 许可证

MIT
