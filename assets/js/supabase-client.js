// Supabase 客户端配置
const SupabaseClient = {
  client: null,
  
  // 初始化 Supabase 客户端
  init() {
    if (!Common.config?.supabase?.url || !Common.config?.supabase?.anon_key) {
      console.error('Supabase 配置缺失');
      return false;
    }
    
    // 动态加载 Supabase 库
    this.loadSupabaseLibrary();
    return true;
  },
  
  // 动态加载 Supabase 库
  async loadSupabaseLibrary() {
    try {
      // 如果已经加载过，直接返回
      if (window.supabase) {
        this.createClient();
        return;
      }
      
      // 加载 Supabase 库
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2';
      script.onload = () => {
        this.createClient();
      };
      script.onerror = () => {
        console.error('Supabase 库加载失败');
        Common.showMessage('Supabase 库加载失败', 'error');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('加载 Supabase 库时出错:', error);
    }
  },
  
  // 创建 Supabase 客户端
  createClient() {
    try {
      this.client = window.supabase.createClient(
        Common.config.supabase.url,
        Common.config.supabase.anon_key
      );
      console.log('Supabase 客户端创建成功');
      
      // 设置认证状态监听
      this.setupAuthListener();
    } catch (error) {
      console.error('创建 Supabase 客户端失败:', error);
      Common.showMessage('数据库连接失败', 'error');
    }
  },
  
  // 设置认证状态监听
  setupAuthListener() {
    if (!this.client) return;
    
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });
  },
  
  // 处理登录
  handleSignIn(session) {
    const user = session.user;
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '用户'
    };
    
    // 保存用户信息到本地存储
    localStorage.setItem('auth_token', session.access_token);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    
    // 更新全局用户状态
    Common.user = userInfo;
    Common.updateUIForAuthenticatedUser();
    
    Common.showMessage(`欢迎回来，${userInfo.name}！`, 'success');
    
    // 如果是从登录页面来的，跳转到首页
    if (window.location.pathname.includes('login')) {
      Common.navigateTo('/');
    }
  },
  
  // 处理登出
  handleSignOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    Common.user = null;
    Common.updateUIForUnauthenticatedUser();
    
    Common.showMessage('已成功登出', 'info');
  },
  
  // Google 登录
  async signInWithGoogle() {
    if (!this.client) {
      Common.showMessage('数据库连接未就绪，请稍后重试', 'error');
      return false;
    }
    
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://zlgan-spec.github.io/ai-day-website/'
        }
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Google 登录失败:', error);
      Common.showMessage('Google 登录失败，请重试', 'error');
      return false;
    }
  },
  
  // 登出
  async signOut() {
    if (!this.client) return false;
    
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      Common.showMessage('登出失败，请重试', 'error');
      return false;
    }
  },
  
  // 获取当前用户
  getCurrentUser() {
    return Common.user;
  },
  
  // 检查是否已登录
  isAuthenticated() {
    return !!Common.user;
  }
};

// 页面加载完成后初始化 Supabase
document.addEventListener('DOMContentLoaded', () => {
  // 等待 Common 模块初始化完成后再初始化 Supabase
  setTimeout(() => {
    if (Common.config) {
      SupabaseClient.init();
    }
  }, 100);
});

// 导出模块
window.SupabaseClient = SupabaseClient;
