// AI-Day 配置管理模块
const ConfigManager = {
  // 默认配置
  defaultConfig: {
    supabase: {
      url: '',
      anon_key: ''
    },
    google: {
      client_id: ''
    }
  },
  
  // 当前配置
  currentConfig: null,
  
  // 初始化配置
  async init() {
    try {
      // 尝试从环境变量读取配置
      this.currentConfig = await this.loadFromEnvironment();
      
      // 如果环境变量中没有配置，尝试从 window.AI_DAY_CONFIG 读取（向后兼容）
      if (!this.currentConfig || !this.isValidConfig(this.currentConfig)) {
        console.warn('环境变量配置无效，尝试使用 window.AI_DAY_CONFIG');
        this.currentConfig = window.AI_DAY_CONFIG || this.defaultConfig;
      }
      
      // 验证配置
      if (!this.isValidConfig(this.currentConfig)) {
        throw new Error('配置验证失败');
      }
      
      console.log('配置加载成功');
      return this.currentConfig;
    } catch (error) {
      console.error('配置初始化失败:', error);
      this.showConfigError();
      return null;
    }
  },
  
  // 从环境变量加载配置
  async loadFromEnvironment() {
    try {
      // 检查是否在 GitHub Pages 环境
      if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
        // 尝试从 GitHub Pages 环境变量读取
        const config = {
          supabase: {
            url: this.getEnvVar('SUPABASE_URL'),
            anon_key: this.getEnvVar('SUPABASE_ANON_KEY')
          },
          google: {
            client_id: this.getEnvVar('GOOGLE_CLIENT_ID')
          }
        };
        
        // 如果所有必需的配置都存在，返回配置
        if (this.isValidConfig(config)) {
          console.log('从环境变量加载配置成功');
          return config;
        }
      }
      
      return null;
    } catch (error) {
      console.error('从环境变量加载配置失败:', error);
      return null;
    }
  },
  
  // 获取环境变量
  getEnvVar(name) {
    // 在 GitHub Pages 中，环境变量通常通过 meta 标签或其他方式提供
    // 这里我们尝试多种方式获取环境变量
    
    // 方法1: 从 GitHub Actions 生成的配置文件获取（最高优先级）
    if (window[name]) {
      return window[name];
    }
    
    // 方法2: 从 meta 标签获取
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag && metaTag.content) {
      return metaTag.content;
    }
    
    // 方法3: 从 data 属性获取
    const dataElement = document.querySelector(`[data-${name.toLowerCase()}]`);
    if (dataElement) {
      return dataElement.getAttribute(`data-${name.toLowerCase()}`);
    }
    
    // 方法4: 从 URL 参数获取（仅用于开发测试）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(name.toLowerCase())) {
      return urlParams.get(name.toLowerCase());
    }
    
    return null;
  },
  
  // 验证配置
  isValidConfig(config) {
    if (!config) return false;
    
    // 检查 Supabase 配置
    if (!config.supabase || !config.supabase.url || !config.supabase.anon_key) {
      console.warn('Supabase 配置不完整');
      return false;
    }
    
    // 检查 Google 配置
    if (!config.google || !config.google.client_id) {
      console.warn('Google 配置不完整');
      return false;
    }
    
    return true;
  },
  
  // 显示配置错误
  showConfigError() {
    const errorMessage = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4">配置错误</h2>
          <p class="text-gray-300 mb-6">系统配置不完整，请联系管理员检查环境变量设置。</p>
          <button onclick="location.reload()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            刷新页面
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', errorMessage);
  },
  
  // 获取当前配置
  getConfig() {
    return this.currentConfig;
  },
  
  // 更新配置
  updateConfig(newConfig) {
    if (this.isValidConfig(newConfig)) {
      this.currentConfig = newConfig;
      console.log('配置已更新');
      return true;
    }
    return false;
  }
};

// 页面加载完成后初始化配置
document.addEventListener('DOMContentLoaded', async () => {
  await ConfigManager.init();
});

// 导出模块
window.ConfigManager = ConfigManager;
