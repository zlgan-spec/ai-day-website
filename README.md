# AI-Day 活动网页

## 🎯 项目概述
AI-Day 是一个持续开放的在线活动平台，用户可以随时通过 Google 登录参与作品提交和投票活动。平台保持永久活跃状态，持续收集作品和投票。

## 🚀 快速开始

### 本地开发
1. 克隆项目到本地
2. 启动开发服务器：`python3 -m http.server 8000` 或 `npm run dev`
3. 访问：`http://localhost:8000`

### 环境配置
项目已改为从环境变量读取配置，支持多种配置方式：

#### 方法一：GitHub Actions（推荐）
1. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GOOGLE_CLIENT_ID`
2. 推送代码到 main 分支，GitHub Actions 会自动部署

#### 方法二：手动配置
在 HTML 页面的 `<head>` 部分添加 meta 标签：
```html
<meta name="SUPABASE_URL" content="https://your-project.supabase.co">
<meta name="SUPABASE_ANON_KEY" content="your-supabase-anon-key">
<meta name="GOOGLE_CLIENT_ID" content="your-google-client-id">
```

详细配置说明请参考 [config/README.md](./config/README.md)

## 📚 文档导航
- [PRD.md](./PRD.md) - 产品需求文档
- [config/README.md](./config/README.md) - 配置说明文档

## 🧪 测试流程
1. 本地功能测试
2. 移动端适配测试
3. 部署上线测试
4. 用户体验测试

## 🛠️ 技术栈
- 前端：HTML5 + TailwindCSS + 原生 JavaScript
- 后端：Supabase (PostgreSQL + Auth + Realtime)
- 部署：GitHub Pages + GitHub Actions

## 🚀 部署状态
- ✅ 配置管理已重构为环境变量
- ✅ GitHub Actions 自动部署已配置
- ✅ GitHub Secrets 已设置
- 🔄 自动部署进行中...

## 📁 项目结构
```
ai-day-website/
├── index.html            # 首页
├── 404.html              # 404错误页面
├── pages/                # 页面HTML文件
│   ├── submit.html       # 作品提交页面
│   └── vote.html         # 投票页面
├── assets/               # 静态资源
│   ├── js/               # JavaScript文件
│   │   ├── config.js     # 配置管理模块
│   │   ├── common.js     # 公共功能模块
│   │   └── supabase-client.js # Supabase客户端
│   ├── css/              # 样式文件
│   └── images/           # 图片资源
├── config/               # 配置文件
│   └── README.md         # 配置说明文档
├── scripts/               # 脚本文件
│   ├── check-deployment.js # 部署检查脚本
│   └── db/               # 数据库脚本
├── .github/              # GitHub配置
│   └── workflows/        # GitHub Actions工作流
├── PRD.md                # 产品需求文档
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind CSS配置
└── README.md             # 项目说明文档
```
