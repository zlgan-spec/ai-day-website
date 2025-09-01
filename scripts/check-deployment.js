#!/usr/bin/env node

/**
 * 部署检查脚本
 * 用于验证配置是否正确设置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 AI-Day 项目部署配置...\n');

// 检查必需的文件
const requiredFiles = [
  'index.html',
  'pages/submit.html',
  'pages/vote.html',
  'assets/js/config.js',
  'assets/js/common.js',
  'assets/js/supabase-client.js',
  '.github/workflows/deploy.yml'
];

console.log('📁 检查必需文件:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// 检查环境变量配置文件
const envConfigFile = 'assets/js/env-config.js';
const envConfigExists = fs.existsSync(envConfigFile);

console.log('\n🔧 检查环境变量配置:');
if (envConfigExists) {
  console.log(`  ✅ ${envConfigFile} 存在`);
  const content = fs.readFileSync(envConfigFile, 'utf8');
  
  // 检查是否包含必需的配置
  const hasSupabaseUrl = content.includes('SUPABASE_URL');
  const hasSupabaseKey = content.includes('SUPABASE_ANON_KEY');
  const hasGoogleClientId = content.includes('GOOGLE_CLIENT_ID');
  
  console.log(`  ${hasSupabaseUrl ? '✅' : '❌'} SUPABASE_URL`);
  console.log(`  ${hasSupabaseKey ? '✅' : '❌'} SUPABASE_ANON_KEY`);
  console.log(`  ${hasGoogleClientId ? '✅' : '❌'} GOOGLE_CLIENT_ID`);
  
  if (!hasSupabaseUrl || !hasSupabaseKey || !hasGoogleClientId) {
    console.log('\n⚠️  环境变量配置不完整！');
    console.log('请确保在 GitHub Secrets 中设置了所有必需的配置。');
  }
} else {
  console.log(`  ⚠️  ${envConfigFile} 不存在`);
  console.log('这通常是正常的，因为该文件由 GitHub Actions 自动生成。');
}

// 检查 .gitignore
console.log('\n📋 检查 .gitignore:');
const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const ignoresEnvConfig = gitignoreContent.includes('env-config.js');
  console.log(`  ${ignoresEnvConfig ? '✅' : '❌'} env-config.js 在 .gitignore 中`);
} else {
  console.log('  ❌ .gitignore 文件不存在');
}

// 总结
console.log('\n📊 检查总结:');
if (allFilesExist) {
  console.log('✅ 所有必需文件都存在');
} else {
  console.log('❌ 部分必需文件缺失');
}

if (envConfigExists) {
  console.log('✅ 环境变量配置文件存在');
} else {
  console.log('⚠️  环境变量配置文件不存在（可能由 CI/CD 生成）');
}

console.log('\n🚀 部署建议:');
console.log('1. 确保在 GitHub Secrets 中设置了所有环境变量');
console.log('2. 推送代码到 main 分支触发自动部署');
console.log('3. 检查 GitHub Actions 部署日志');
console.log('4. 验证网站功能是否正常');

console.log('\n📖 更多信息请参考:');
console.log('- config/README.md - 配置说明');
console.log('- .github/workflows/deploy.yml - 部署配置');
