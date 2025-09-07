# SVG Mono Compress - VSCode 插件

一个强大的 VSCode 插件，用于压缩 SVG 文件并支持单色转换。基于 SVGO 官方库，提供高质量的 SVG 优化功能。

## 功能特性

- **SVG 压缩**：使用 SVGO 官方默认配置压缩 SVG 文件
- **单色转换**：将彩色 SVG 转换为单色版本，自动继承父元素颜色
- **批量处理**：支持同时处理多个 SVG 文件
- **智能识别**：自动识别 SVG 文件，过滤非 SVG 文件
- **配置支持**：支持项目级别的 SVGO 自定义配置文件
- **右键菜单**：集成到 VSCode 右键菜单，使用便捷

## 安装使用

### 从 VSCode 市场安装

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "SVG Mono Compress"
4. 点击安装

### 本地安装（开发版本）

1. 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 `.vsix` 文件

## 使用方法

### 基本使用

1. 在 VSCode 中右键点击 SVG 文件
2. 选择以下选项之一：
   - **压缩 SVG**：使用默认配置压缩文件
   - **压缩为单色 SVG**：压缩并转换为单色版本

### 批量处理

1. 选择多个 SVG 文件（按住 Ctrl 点击）
2. 右键选择压缩选项
3. 插件会自动处理所有选中的 SVG 文件

### 自定义配置

在项目根目录创建 `svgo.config.js` 文件：

```js
module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
};
```

## 开发环境

### 环境要求

- Node.js 18+
- npm 或 yarn
- VSCode 1.74.0+

### 开发设置

```bash
# 克隆项目
git clone <repository-url>
cd svg-mono-compress

# 安装依赖
npm install

# 编译项目
npm run compile

# 监听模式（开发时使用）
npm run watch
```

### 调试插件

1. 在 VSCode 中打开项目
2. 按 `F5` 启动调试
3. 在新打开的 VSCode 窗口中测试插件功能

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration
```

### 测试文件

项目包含多种测试样本：

- `test/samples/colorful-icon.svg` - 彩色图标
- `test/samples/simple-mono.svg` - 简单单色图形
- `test/samples/complex-gradient.svg` - 复杂渐变图形
- `test/samples/large-file.svg` - 大文件测试
- `test/samples/broken.svg` - 损坏文件测试

## 发布插件

### 准备工作

1. **安装 vsce 工具**
   ```bash
   npm install -g vsce
   ```

2. **准备发布资源**
   - 确保 `package.json` 中的版本号、描述、作者等信息正确
   - 添加插件图标（128x128 像素，PNG 格式）
   - 完善 README.md 和 CHANGELOG.md
   - 确保所有测试通过

3. **获取发布令牌**
   - 访问 [Azure DevOps](https://dev.azure.com/)
   - 创建个人访问令牌（PAT）
   - 权限设置为 "Marketplace (manage)"

### 打包插件

```bash
# 编译项目
npm run compile

# 打包为 .vsix 文件
vsce package

# 指定版本打包
vsce package --pre-release
```

### 发布到市场

```bash
# 首次发布需要登录
vsce login <publisher-name>

# 发布插件
vsce publish

# 发布预发布版本
vsce publish --pre-release

# 发布指定版本
vsce publish 1.0.1
```

### 本地测试安装

```bash
# 安装本地打包的插件
code --install-extension svg-mono-compress-1.0.0.vsix

# 卸载插件
code --uninstall-extension <publisher>.<extension-name>
```

### 发布检查清单

- [ ] 版本号已更新
- [ ] 所有测试通过
- [ ] README.md 内容完整
- [ ] CHANGELOG.md 已更新
- [ ] 插件图标已添加
- [ ] package.json 信息完整
- [ ] 本地测试功能正常
- [ ] 打包文件大小合理

## 技术栈

- **TypeScript** - 主要开发语言
- **SVGO** - SVG 优化库
- **VSCode Extension API** - 插件开发框架
- **Mocha + Chai** - 测试框架

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md) 文件
