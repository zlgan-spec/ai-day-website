# AI-Day 活动网页

## 🎯 项目概述
AI-Day 是一个持续开放的在线活动平台，用户可以随时通过 Google 登录参与作品提交和投票活动。平台保持永久活跃状态，持续收集作品和投票。

## 🚀 快速开始

### 本地开发
1. 克隆项目到本地
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 访问：`http://localhost:8000`

### 环境配置
- 复制 `config/project.example.json` 为 `config/project.json`
- 填入你的 Supabase 配置信息

## 📚 文档导航
- [PRD.md](./docs/PRD.md) - 产品需求文档
- [SPEC.md](./docs/SPEC.md) - 技术规范文档
- [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) - 开发指南
- [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - 部署指南

## 🧪 测试流程
1. 本地功能测试
2. 移动端适配测试
3. 部署上线测试
4. 用户体验测试

## 🛠️ 技术栈
- 前端：HTML5 + TailwindCSS + 原生 JavaScript
- 后端：Supabase (PostgreSQL + Auth + Realtime)
- 部署：Vercel/Netlify

## 📁 项目结构
```
ai-day-website/
├── pages/                 # 页面HTML文件
├── assets/               # 静态资源
│   ├── js/              # JavaScript文件
│   └── css/             # 样式文件
├── config/               # 配置文件
├── scripts/              # 脚本文件
└── docs/                 # 文档目录
```
