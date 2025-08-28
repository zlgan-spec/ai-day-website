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
      
      // 检查是否有现有的认证会话
      this.checkExistingSession();
    } catch (error) {
      console.error('创建 Supabase 客户端失败:', error);
      Common.showMessage('数据库连接失败', 'error');
    }
  },
  
  // 检查现有的认证会话
  async checkExistingSession() {
    if (!this.client) return;
    
    try {
      const { data: { session }, error } = await this.client.auth.getSession();
      if (error) {
        console.warn('获取现有会话失败:', error);
        return;
      }
      
      if (session && session.user) {
        console.log('发现现有认证会话，恢复用户状态');
        this.handleSignIn(session);
      } else {
        console.log('没有发现现有认证会话');
        // 检查本地存储中是否有用户信息
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');
        
        if (token && userInfo) {
          try {
            const user = JSON.parse(userInfo);
            if (user && user.id && user.email) {
              console.log('从本地存储恢复用户状态');
              Common.user = user;
              Common.updateUIForAuthenticatedUser();
            } else {
              console.log('本地存储的用户信息无效，清除数据');
              Common.clearAuthData();
            }
          } catch (parseError) {
            console.warn('解析本地用户信息失败，清除数据:', parseError);
            Common.clearAuthData();
          }
        } else {
          console.log('本地存储中也没有用户信息');
        }
      }
    } catch (error) {
      console.error('检查现有会话时出错:', error);
    }
  },
  
  // 设置认证状态监听
  setupAuthListener() {
    if (!this.client) return;
    
    this.client.auth.onAuthStateChange((event, session) => {
      console.log('认证状态变化:', event, session ? '有会话' : '无会话');
      
      // 如果是手动登出，跳过状态监听处理
      if (event === 'SIGNED_OUT' && !Common.user) {
        console.log('检测到手动登出，跳过状态监听处理');
        return;
      }
      
      if (event === 'SIGNED_IN' && session) {
        this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // 更新本地存储的 token
        localStorage.setItem('auth_token', session.access_token);
      } else if (event === 'USER_UPDATED' && session) {
        // 用户信息更新
        this.handleSignIn(session);
      }
    });
  },
  
  // 处理登录
  handleSignIn(session) {
    try {
      const user = session.user;
      if (!user || !user.id || !user.email) {
        console.error('无效的用户会话数据:', session);
        return;
      }
      
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
    } catch (error) {
      console.error('处理登录时出错:', error);
      Common.showMessage('登录状态处理失败', 'error');
    }
  },
  
  // 处理登出
  handleSignOut() {
    // 如果用户已经手动登出，跳过处理
    if (!Common.user) {
      console.log('用户已手动登出，跳过 handleSignOut 处理');
      return;
    }
    
    console.log('处理 Supabase 触发的登出事件');
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
    try {
      console.log('开始登出流程');
      
      // 直接清除本地存储，不依赖 Supabase API
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      
      // 清除全局用户状态
      Common.user = null;
      
      // 更新 UI 为未认证状态
      Common.updateUIForUnauthenticatedUser();
      
      // 如果有 Supabase 客户端，尝试清理客户端状态（但不调用 API）
      if (this.client) {
        try {
          // 直接清理客户端的内部状态，不调用 signOut API
          this.client.auth.setSession(null);
          console.log('Supabase 客户端状态已清理');
        } catch (clientError) {
          console.warn('清理 Supabase 客户端状态时出错（非关键错误）:', clientError);
        }
      }
      
      Common.showMessage('已成功登出', 'success');
      console.log('登出流程完成');
      return true;
      
    } catch (error) {
      console.error('登出过程中发生错误:', error);
      
      // 即使出错，也要确保本地状态被清除
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      Common.user = null;
      Common.updateUIForUnauthenticatedUser();
      
      Common.showMessage('登出完成', 'info');
      return true;
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
