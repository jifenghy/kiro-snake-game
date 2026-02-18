# 自有服务器部署指南

本指南详细介绍如何在自己购买的服务器上部署贪吃蛇游戏。

## 📋 前提条件

- 一台 Linux 服务器（Ubuntu/CentOS/Debian 等）
- 服务器的 SSH 访问权限
- 域名（可选，也可以使用 IP 地址访问）
- 基本的 Linux 命令行知识

---

## 🚀 方案1：使用 Nginx（推荐）

### 步骤1：在本地构建项目

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，会在 `dist` 目录生成所有静态文件。

### 步骤2：连接到服务器

```bash
ssh 用户名@服务器IP地址
# 例如：ssh root@123.45.67.89
```

### 步骤3：安装 Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx -y
```

**CentOS/RHEL:**
```bash
sudo yum install epel-release -y
sudo yum install nginx -y
```

### 步骤4：启动 Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx  # 开机自启
```

### 步骤5：上传文件到服务器

在本地电脑上执行（不是在服务器上）：

```bash
# 创建目标目录（在服务器上）
ssh 用户名@服务器IP "sudo mkdir -p /var/www/snake-game"

# 上传 dist 目录的所有文件
scp -r dist/* 用户名@服务器IP:/var/www/snake-game/

# 设置权限
ssh 用户名@服务器IP "sudo chown -R www-data:www-data /var/www/snake-game"
```

### 步骤6：配置 Nginx

在服务器上创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/snake-game
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name 你的域名.com;  # 或者使用 _ 表示任意域名
    
    root /var/www/snake-game;
    index index.html;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 步骤7：启用配置并重启 Nginx

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/snake-game /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤8：配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤9：访问游戏

在浏览器中访问：`http://你的服务器IP` 或 `http://你的域名.com`

---

## 🔒 方案2：使用 Nginx + HTTPS（推荐用于生产环境）

### 前提：你需要一个域名

### 步骤1-6：同上

### 步骤7：安装 Certbot（Let's Encrypt）

**Ubuntu/Debian:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx -y
```

### 步骤8：获取 SSL 证书

```bash
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com
```

按照提示操作：
- 输入邮箱地址
- 同意服务条款
- 选择是否重定向 HTTP 到 HTTPS（推荐选择 Yes）

### 步骤9：自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# Certbot 会自动设置定时任务
```

现在可以通过 `https://你的域名.com` 访问游戏了！

---

## 🐳 方案3：使用 Docker（适合容器化部署）

### 步骤1：创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 步骤2：创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 步骤3：构建 Docker 镜像

```bash
docker build -t snake-game .
```

### 步骤4：运行容器

```bash
docker run -d -p 80:80 --name snake-game snake-game
```

### 步骤5：访问游戏

访问 `http://服务器IP`

---

## 📦 方案4：使用 Apache

### 步骤1：安装 Apache

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install apache2 -y
```

**CentOS/RHEL:**
```bash
sudo yum install httpd -y
```

### 步骤2：上传文件

```bash
scp -r dist/* 用户名@服务器IP:/var/www/html/snake-game/
```

### 步骤3：配置 Apache

创建配置文件：

```bash
sudo nano /etc/apache2/sites-available/snake-game.conf
```

粘贴配置：

```apache
<VirtualHost *:80>
    ServerName 你的域名.com
    DocumentRoot /var/www/html/snake-game
    
    <Directory /var/www/html/snake-game>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA 路由支持
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/snake-game-error.log
    CustomLog ${APACHE_LOG_DIR}/snake-game-access.log combined
</VirtualHost>
```

### 步骤4：启用配置

```bash
sudo a2ensite snake-game
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## 🔄 自动化部署脚本

创建一个部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 配置
SERVER_USER="用户名"
SERVER_IP="服务器IP"
SERVER_PATH="/var/www/snake-game"

echo "🔨 构建项目..."
npm run build

echo "📦 压缩文件..."
tar -czf dist.tar.gz dist/

echo "📤 上传到服务器..."
scp dist.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🚀 部署到服务器..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /tmp
    sudo rm -rf /var/www/snake-game/*
    sudo tar -xzf dist.tar.gz -C /var/www/snake-game --strip-components=1
    sudo chown -R www-data:www-data /var/www/snake-game
    rm dist.tar.gz
    echo "✅ 部署完成！"
EOF

echo "🧹 清理本地文件..."
rm dist.tar.gz

echo "🎉 部署成功！访问 http://$SERVER_IP"
```

使用方法：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🛠️ 常见问题排查

### 问题1：无法访问网站

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口是否开放
sudo netstat -tulpn | grep :80
```

### 问题2：403 Forbidden

```bash
# 检查文件权限
ls -la /var/www/snake-game

# 修复权限
sudo chown -R www-data:www-data /var/www/snake-game
sudo chmod -R 755 /var/www/snake-game
```

### 问题3：页面刷新后 404

确保 Nginx 配置中有：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 📊 性能优化建议

### 1. 启用 HTTP/2

在 Nginx 配置中：
```nginx
listen 443 ssl http2;
```

### 2. 配置缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 启用 Brotli 压缩（可选）

```bash
sudo apt install nginx-module-brotli
```

---

## 🔐 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

3. **禁用目录列表**
   ```nginx
   autoindex off;
   ```

4. **隐藏 Nginx 版本**
   ```nginx
   server_tokens off;
   ```

---

## 📱 域名配置

如果你有域名，需要在域名服务商处添加 DNS 记录：

```
类型: A
主机记录: @
记录值: 你的服务器IP
TTL: 600

类型: A
主机记录: www
记录值: 你的服务器IP
TTL: 600
```

---

## 🎯 快速部署检查清单

- [ ] 服务器已购买并可以 SSH 连接
- [ ] 已安装 Nginx/Apache
- [ ] 已构建项目（npm run build）
- [ ] 已上传文件到服务器
- [ ] 已配置 Web 服务器
- [ ] 防火墙已开放 80/443 端口
- [ ] （可选）已配置域名 DNS
- [ ] （可选）已安装 SSL 证书
- [ ] 游戏可以正常访问和运行

---

## 💡 推荐配置

**小型项目（个人使用）：**
- 1 核 CPU
- 1GB 内存
- 10GB 存储
- 1Mbps 带宽

**中型项目（多人访问）：**
- 2 核 CPU
- 2GB 内存
- 20GB 存储
- 5Mbps 带宽

---

## 🆘 获取帮助

如果遇到问题：
- Nginx 文档：https://nginx.org/en/docs/
- Let's Encrypt：https://letsencrypt.org/
- Docker 文档：https://docs.docker.com/

祝你部署顺利！🎮
