# AI-Day 配置说明

## 环境变量配置

本项目已改为从环境变量中读取配置，支持多种配置方式：

### 1. Meta 标签方式（推荐）

在 HTML 页面的 `<head>` 部分添加以下 meta 标签：

```html
<meta name="SUPABASE_URL" content="https://your-project.supabase.co">
<meta name="SUPABASE_ANON_KEY" content="your-supabase-anon-key">
<meta name="GOOGLE_CLIENT_ID" content="your-google-client-id">
```

### 2. Data 属性方式

在 HTML 页面的任意元素上添加 data 属性：

```html
<div data-supabase-url="https://your-project.supabase.co" 
     data-supabase-anon-key="your-supabase-anon-key"
     data-google-client-id="your-google-client-id">
</div>
```

### 3. 全局变量方式

在 JavaScript 中设置全局变量：

```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-supabase-anon-key';
window.GOOGLE_CLIENT_ID = 'your-google-client-id';
```

### 4. URL 参数方式（仅用于开发测试）

在 URL 中添加参数：

```
https://your-site.github.io/?supabase_url=https://your-project.supabase.co&supabase_anon_key=your-key&google_client_id=your-id
```

## GitHub Pages 部署

### 方法一：使用 GitHub Actions（推荐）

1. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GOOGLE_CLIENT_ID`

2. 创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build with environment variables
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
      run: |
        # 创建包含环境变量的配置文件
        cat > config.js << EOF
        window.SUPABASE_URL = '$SUPABASE_URL';
        window.SUPABASE_ANON_KEY = '$SUPABASE_ANON_KEY';
        window.GOOGLE_CLIENT_ID = '$GOOGLE_CLIENT_ID';
        EOF
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

### 方法二：手动设置

1. 在 `index.html` 的 `<head>` 部分添加 meta 标签：

```html
<head>
    <!-- 其他 meta 标签 -->
    <meta name="SUPABASE_URL" content="https://your-project.supabase.co">
    <meta name="SUPABASE_ANON_KEY" content="your-supabase-anon-key">
    <meta name="GOOGLE_CLIENT_ID" content="your-google-client-id">
</head>
```

2. 同样在 `pages/submit.html` 和 `pages/vote.html` 中添加相同的 meta 标签。

## 配置验证

配置管理模块会自动验证配置的完整性，如果配置不完整会显示错误页面。

## 向后兼容

为了保持向后兼容，如果环境变量配置不可用，系统会尝试使用 `window.AI_DAY_CONFIG` 作为备选配置。

## 安全注意事项

- 不要在代码中硬编码敏感信息
- 使用环境变量或 GitHub Secrets 存储敏感配置
- 定期轮换 API 密钥
- 确保 Supabase 项目的 RLS（Row Level Security）已正确配置
