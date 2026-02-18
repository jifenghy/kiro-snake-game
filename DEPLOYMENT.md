# 贪吃蛇游戏部署指南

本文档介绍如何将贪吃蛇游戏部署到各种平台，让其他人可以访问。

## 🚀 方案1：Vercel（推荐，最简单）

Vercel 提供免费的静态网站托管，自动 HTTPS，全球 CDN。

### 方法A：通过 Vercel CLI 部署

1. **登录 Vercel**
   ```bash
   vercel login
   ```

2. **部署项目**
   ```bash
   vercel
   ```
   
   首次部署会询问几个问题：
   - Set up and deploy? → Yes
   - Which scope? → 选择你的账号
   - Link to existing project? → No
   - What's your project's name? → snake-game（或自定义）
   - In which directory is your code located? → ./
   
3. **部署到生产环境**
   ```bash
   vercel --prod
   ```

4. 完成！Vercel 会给你一个 URL，例如：`https://snake-game-xxx.vercel.app`

### 方法B：通过 GitHub + Vercel（推荐）

1. **将代码推送到 GitHub**
   ```bash
   # 创建 GitHub 仓库后
   git remote add origin https://github.com/你的用户名/snake-game.git
   git branch -M main
   git push -u origin main
   ```

2. **在 Vercel 网站部署**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - Vercel 会自动检测 Vite 项目
   - 点击 "Deploy"

3. 每次推送代码到 GitHub，Vercel 会自动重新部署！

---

## 🌐 方案2：Netlify

Netlify 也是优秀的免费托管平台。

### 方法A：通过 Netlify CLI

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录**
   ```bash
   netlify login
   ```

3. **部署**
   ```bash
   netlify deploy --prod
   ```
   
   - Build command: `npm run build`
   - Publish directory: `dist`

### 方法B：拖放部署

1. 构建项目：`npm run build`
2. 访问 https://app.netlify.com/drop
3. 将 `dist` 文件夹拖放到页面上
4. 完成！

---

## 📦 方案3：GitHub Pages

完全免费，适合开源项目。

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **修改 package.json**，添加：
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://你的用户名.github.io/snake-game"
   }
   ```

3. **修改 vite.config.ts**，添加 base：
   ```typescript
   export default defineConfig({
     base: '/snake-game/',
     // ... 其他配置
   })
   ```

4. **部署**
   ```bash
   npm run deploy
   ```

5. 访问：`https://你的用户名.github.io/snake-game`

---

## 🐳 方案4：自己的服务器（使用 Nginx）

如果你有自己的服务器：

1. **构建项目**
   ```bash
   npm run build
   ```

2. **上传 dist 文件夹到服务器**
   ```bash
   scp -r dist/* user@your-server:/var/www/snake-game/
   ```

3. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/snake-game;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **重启 Nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

## 🔧 本地预览生产构建

在部署前，可以本地预览生产版本：

```bash
npm run build
npm run preview
```

访问 http://localhost:4173

---

## 📊 部署后检查清单

- [ ] 游戏可以正常启动
- [ ] 键盘控制正常工作
- [ ] 触摸控制在移动设备上正常工作
- [ ] 虚拟方向键在移动设备上显示
- [ ] 排行榜可以保存和读取
- [ ] 响应式设计在不同设备上正常
- [ ] 所有按钮功能正常

---

## 🌟 推荐配置

**最佳选择：Vercel + GitHub**
- ✅ 完全免费
- ✅ 自动部署
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 自定义域名支持

**快速测试：Netlify Drop**
- ✅ 无需注册
- ✅ 拖放即可
- ✅ 立即可用

---

## 🔗 获取帮助

如果遇到问题：
- Vercel 文档：https://vercel.com/docs
- Netlify 文档：https://docs.netlify.com
- GitHub Pages 文档：https://pages.github.com

---

## 📱 分享你的游戏

部署完成后，你可以：
1. 复制 URL 分享给朋友
2. 生成二维码让手机用户扫描
3. 在社交媒体上分享

祝你部署顺利！🎮
