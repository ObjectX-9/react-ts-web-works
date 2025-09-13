# 🔧 Web Worker 演示项目

[![部署状态](https://github.com/ObjectX-9/react-ts-web-works/workflows/部署到%20GitHub%20Pages/badge.svg)](https://github.com/ObjectX-9/react-ts-web-works/actions)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://ObjectX-9.github.io/react-ts-web-works/)

一个展示 Web Worker 使用方法和性能优势的 React + TypeScript 演示项目。

## ✨ 功能特性

- 📚 **详细教程**: Web Worker 原理、用法和最佳实践
- 🔧 **实时演示**: 对比主线程阻塞与 Web Worker 的性能差异
- ⚛️ **现代技术栈**: React 18 + TypeScript + Vite + Less
- 📱 **响应式设计**: 支持桌面和移动设备
- 🎯 **多种示例**: 斐波那契计算、素数查找、密集数学运算

## 🚀 在线演示

访问 [在线演示](https://ObjectX-9.github.io/react-ts-web-works/) 体验完整功能。

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/ObjectX-9/react-ts-web-works.git
cd react-ts-web-works

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📦 项目结构

```
react-ts-web-works/
├── src/
│   ├── components/          # React 组件
│   │
```

## 🔄 自动部署

项目使用 GitHub Actions 实现自动化部署：

- **触发条件**: 推送到 `main` 分支
- **构建流程**: 类型检查 → ESLint 检查 → 构建项目
- **部署目标**: GitHub Pages
- **访问地址**: \`https://your-username.github.io/webwork/\`

### 部署步骤

1. Fork 此仓库到您的 GitHub 账户
2. 在仓库设置中启用 GitHub Pages
3. 将 Pages 源设置为 "GitHub Actions"
4. 推送代码到 `main` 分支即可自动部署

## 🎯 Web Worker 使用场景

- ✅ **适合**: CPU 密集型计算、大数据处理、复杂算法
- ❌ **不适合**: 简单操作、频繁 DOM 操作、小数据量处理

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- React 团队提供的优秀框架
- Vite 提供的快速构建工具
- MDN Web Docs 的详细文档
