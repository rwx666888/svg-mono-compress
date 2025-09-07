# VSCode SVG压缩插件测试指南

本文档详细说明如何测试VSCode SVG压缩插件的各项功能。

## 目录结构

```
test/
├── README.md                 # 本测试指南
├── runTests.js              # 测试运行器
├── samples/                 # 测试样本文件
│   ├── colorful-icon.svg    # 彩色图标（用于测试压缩和单色转换）
│   ├── complex-gradient.svg # 复杂渐变图形（用于测试复杂SVG处理）
│   ├── simple-mono.svg      # 简单单色图标（用于测试已单色文件处理）
│   ├── large-file.svg       # 大尺寸文件（用于性能测试）
│   └── broken.svg           # 损坏的SVG文件（用于错误处理测试）
├── unit/                    # 单元测试
│   └── svgProcessor.test.js # SVG处理器单元测试
└── integration/             # 集成测试
    └── extension.test.js    # VSCode扩展集成测试
```

## 关于out目录

**out目录是必需的！** 它包含TypeScript编译后的JavaScript文件：

- `out/extension.js` - 插件的主入口文件
- `out/` 目录下的其他编译文件
- VSCode插件运行时需要这些编译后的文件
- 虽然可以在`.gitignore`中忽略，但不应删除
- 每次修改TypeScript代码后需要重新编译生成

## 快速开始

### 1. 运行测试运行器

```bash
cd test
node runTests.js
```

这将：
- 验证测试环境
- 运行单元测试
- 显示集成测试指南
- 提供完整的测试说明

### 2. 开发环境测试

在VSCode中测试插件：

1. **启动扩展开发主机**
   - 在项目根目录按 `F5`
   - 或者运行调试配置 "Run Extension"
   - 这会打开一个新的VSCode窗口（扩展开发主机）

2. **在扩展开发主机中测试**
   - 打开包含SVG文件的文件夹
   - 右键点击SVG文件查看菜单选项
   - 测试各项功能

## 功能测试

### 单文件压缩测试

1. 在扩展开发主机中右键点击 `test/samples/colorful-icon.svg`
2. 选择 "压缩SVG"
3. **预期结果：**
   - 文件大小减小
   - 保持SVG格式和视觉效果
   - 显示成功消息

### 单色转换测试

1. 右键点击 `test/samples/colorful-icon.svg`
2. 选择 "转换为单色SVG"
3. **预期结果：**
   - 移除所有颜色属性
   - 文件大小减小
   - 图形变为单色（使用currentColor）
   - 显示成功消息

### 批量处理测试

1. 在文件资源管理器中选择多个SVG文件
   - 按住 `Ctrl` 点击多个文件
   - 或选择包含SVG文件的文件夹
2. 右键选择压缩或单色转换
3. **预期结果：**
   - 所有选中的SVG文件都被处理
   - 显示处理结果统计

### 错误处理测试

1. 右键点击 `test/samples/broken.svg`
2. 尝试压缩或转换
3. **预期结果：**
   - 显示适当的错误消息
   - 不会崩溃或产生异常

### 性能测试

1. 右键点击 `test/samples/large-file.svg`
2. 执行压缩操作
3. **预期结果：**
   - 能够处理大文件
   - 处理时间合理
   - 显示处理进度或结果

## 单元测试

运行单元测试：

```bash
cd test/unit
node svgProcessor.test.js
```

单元测试覆盖：
- 文件读取功能
- SVG压缩逻辑
- 单色转换逻辑
- 错误处理机制
- 批量处理功能

## 集成测试

集成测试需要在VSCode环境中运行：

1. 按 `F5` 启动扩展开发主机
2. 在扩展开发主机中按 `Ctrl+Shift+P`
3. 运行 "Developer: Reload Window"
4. 按 `Ctrl+Shift+P`，运行 "Test: Run All Tests"

集成测试覆盖：
- 命令注册验证
- 右键菜单功能
- 完整的用户工作流
- VSCode API集成

## 编译和打包测试

### 编译测试

```bash
npm run compile
```

验证：
- TypeScript编译无错误
- `out/` 目录生成正确的JavaScript文件
- 所有依赖正确解析

### 打包测试

```bash
# 安装vsce（如果未安装）
npm install -g vsce

# 打包插件
vsce package
```

这会生成 `.vsix` 文件，可以用于：
- 本地安装测试
- 分发给其他用户
- 发布到VSCode市场

### 安装测试

```bash
# 安装打包的插件
code --install-extension svg-mono-compress-*.vsix
```

## 测试检查清单

### 基础功能
- [ ] 插件正确加载和激活
- [ ] 右键菜单显示压缩选项
- [ ] 单文件SVG压缩工作正常
- [ ] 单文件单色转换工作正常
- [ ] 批量处理多个文件
- [ ] 错误文件显示适当错误消息

### 用户体验
- [ ] 操作完成后显示成功消息
- [ ] 错误情况显示清晰的错误信息
- [ ] 处理大文件时性能可接受
- [ ] 菜单项只在SVG文件上显示

### 技术验证
- [ ] TypeScript编译无错误
- [ ] 所有依赖正确安装
- [ ] SVGO配置正确加载
- [ ] 文件操作安全可靠

### 兼容性
- [ ] 在不同操作系统上工作
- [ ] 与不同版本的VSCode兼容
- [ ] 处理各种SVG文件格式

## 故障排除

### 常见问题

1. **插件未激活**
   - 检查 `package.json` 中的激活事件
   - 确保扩展正确注册

2. **右键菜单未显示**
   - 检查 `when` 条件是否正确
   - 确认文件扩展名匹配

3. **编译错误**
   - 运行 `npm install` 安装依赖
   - 检查TypeScript配置

4. **SVGO错误**
   - 确认SVGO版本兼容性
   - 检查配置文件格式

### 调试技巧

1. **使用开发者工具**
   - 在扩展开发主机中按 `F12`
   - 查看控制台错误和日志

2. **添加调试日志**
   - 在代码中添加 `console.log`
   - 使用VSCode的输出面板

3. **断点调试**
   - 在TypeScript代码中设置断点
   - 使用VSCode调试器

## 测试报告

测试完成后，请记录：
- 测试环境（操作系统、VSCode版本）
- 测试结果（通过/失败的功能）
- 发现的问题和建议
- 性能表现

这个测试框架确保插件的质量和可靠性，为用户提供良好的使用体验。