# 开发与发布说明

该文档面向开发者与维护者，包含开发、调试、测试、打包与发布流程。

相关文档：

- 用户文档（中文）：[README.md](./README.md)
- User Guide (English): [README.en.md](./README.en.md)

## 开发环境

- Node.js 18+
- npm 或 yarn
- VSCode 1.74.0+

## 开发设置

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

## 调试插件

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

### 测试样本

- `test/samples/colorful-icon.svg` - 彩色图标
- `test/samples/simple-mono.svg` - 简单单色图形
- `test/samples/complex-gradient.svg` - 复杂渐变图形
- `test/samples/large-file.svg` - 大文件测试
- `test/samples/broken.svg` - 损坏文件测试

## 发布插件

### 准备工作

1. 安装 `vsce`：

```bash
npm install -g @vscode/vsce
```

2. 准备发布资源：
- 检查 `package.json` 的版本号、描述、作者信息
- 准备插件图标（128x128，PNG）
- 更新 `README.md` 与 `CHANGELOG.md`
- 确保测试通过

3. 获取发布令牌：
- 访问 [Azure DevOps](https://dev.azure.com/)
- 创建个人访问令牌（PAT）
- 权限设置为 `Marketplace (manage)`

### 打包

```bash
# 编译项目
npm run compile

# 打包为 .vsix 文件
vsce package

# 打包预发布版本
vsce package --pre-release
```

### 发布

```bash
# 首次发布需要登录
vsce login <publisher-name>

# 发布正式版本
vsce publish

# 发布预发布版本
vsce publish --pre-release

# 发布指定版本
vsce publish 1.0.1
```

### 本地安装测试

```bash
# 安装本地打包插件
code --install-extension svg-mono-compress-1.0.0.vsix

# 卸载插件
code --uninstall-extension <publisher>.<extension-name>
```

### 发布检查清单

- [ ] 版本号已更新
- [ ] 所有测试通过
- [ ] README 与 CHANGELOG 已更新
- [ ] 插件图标已检查
- [ ] package.json 信息完整
- [ ] 本地安装验证通过
- [ ] VSIX 包体积合理

## 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/xxx`
3. 提交修改：`git commit -m "feat: ..."`
4. 推送分支：`git push origin feature/xxx`
5. 发起 Pull Request
