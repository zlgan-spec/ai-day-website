// AI-Day 公共功能模块
const Common = {
  // 配置信息
  config: null,
  
  // 用户状态
  user: null,
  
  // 初始化
  async init() {
    await this.loadConfig();
    this.setupEventListeners();
    this.checkAuthStatus();
  },
  
  // 加载配置文件
  async loadConfig() {
    try {
      // 优先使用生产环境配置
      if (window.AI_DAY_CONFIG) {
        this.config = window.AI_DAY_CONFIG;
        console.log('使用生产环境配置');
        return;
      }
      
      // GitHub Pages 环境下，如果没有配置则显示错误
      console.error('生产环境配置未找到');
      this.showMessage('系统配置错误，请联系管理员', 'error');
    } catch (error) {
      console.error('配置加载失败:', error);
      this.showMessage('系统配置错误，请联系管理员', 'error');
    }
  },
  
  // 设置事件监听器
  setupEventListeners() {
    // 全局错误处理
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  },
  
  // 检查认证状态
  checkAuthStatus() {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');
      
      if (token && userInfo) {
        try {
          this.user = JSON.parse(userInfo);
          // 验证用户信息的完整性
          if (this.user && this.user.id && this.user.email) {
            this.updateUIForAuthenticatedUser();
            return;
          }
        } catch (parseError) {
          console.warn('用户信息解析失败，清除无效数据:', parseError);
        }
      }
      
      // 如果没有有效数据，清除所有认证信息
      this.clearAuthData();
      this.updateUIForUnauthenticatedUser();
    } catch (error) {
      console.error('检查认证状态时出错:', error);
      this.clearAuthData();
      this.updateUIForUnauthenticatedUser();
    }
  },
  
  // 清除认证数据
  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    this.user = null;
  },
  
      // 更新已认证用户的UI
    updateUIForAuthenticatedUser() {
        const authElements = document.querySelectorAll('[data-auth="required"]');
        authElements.forEach(el => el.style.display = 'block');
        
        const unauthElements = document.querySelectorAll('[data-auth="unauth"]');
        unauthElements.forEach(el => el.style.display = 'none');
        
        // 显示用户信息
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl && this.user.name) {
            userInfoEl.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-semibold">${this.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span class="text-white text-sm">${this.user.name}</span>
                </div>
            `;
            userInfoEl.classList.remove('hidden');
        }
    },
  
  // 更新未认证用户的UI
  updateUIForUnauthenticatedUser() {
    const authElements = document.querySelectorAll('[data-auth="required"]');
    authElements.forEach(el => el.style.display = 'none');
    
    const unauthElements = document.querySelectorAll('[data-auth="unauth"]');
    unauthElements.forEach(el => el.style.display = 'block');
    
    // 清除用户信息显示
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl) {
      userInfoEl.innerHTML = '';
      userInfoEl.classList.add('hidden');
    }
    
    // 显示登录按钮
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.classList.remove('hidden');
    }
    
    // 隐藏退出登录按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.classList.add('hidden');
    }
  },
  
  // 显示消息
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    
    // 简化消息类型，只保留最核心的
    let bgColor, icon;
    switch(type) {
      case 'success':
        bgColor = 'bg-green-900/20';
        icon = `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`;
        break;
      case 'error':
        bgColor = 'bg-red-900/20';
        icon = `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;
        break;
      default:
        bgColor = 'bg-gray-900/20';
        icon = `<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;
    }
    
    // 移除边框，保持简洁的毛玻璃效果，位置改为右下角
    messageEl.className = `fixed bottom-4 right-4 p-4 rounded-2xl shadow-lg z-50 animate-fade-in backdrop-blur-sm ${bgColor}`;
    messageEl.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="flex-1">
          <p class="text-white font-medium">${message}</p>
        </div>
        <button class="flex-shrink-0 text-gray-400 hover:text-white transition-colors" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    // 简化悬停效果
    messageEl.addEventListener('mouseenter', () => {
      messageEl.style.transform = 'translateY(-1px)';
    });
    
    messageEl.addEventListener('mouseleave', () => {
      messageEl.style.transform = 'translateY(0)';
    });
    
    document.body.appendChild(messageEl);
    
    // 自动消失
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-5px)';
        setTimeout(() => {
          if (messageEl.parentElement) {
            messageEl.remove();
          }
        }, 200);
      }
    }, 3500);
  },
  
  // 全局错误处理
  handleGlobalError(error) {
    console.error('全局错误:', error);
    this.showMessage('发生未知错误，请刷新页面重试', 'error');
  },
  
  // 页面可见性变化处理
  handleVisibilityChange() {
    if (!document.hidden) {
      this.checkAuthStatus();
    }
  },
  
  // 导航到指定页面
  navigateTo(page) {
    window.location.href = page;
  },
  
  // 返回上一页
  goBack() {
    window.history.back();
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  Common.init();
});

// 导出模块
window.Common = Common;
