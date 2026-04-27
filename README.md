# SVG Mono Compress - VSCode 插件

一个强大的 VSCode 插件，用于压缩 SVG 文件并支持单色转换。基于 SVGO 官方库，提供高质量的 SVG 优化功能。
[English](./README.en.md) | 简体中文

## 功能特性

- **SVG 压缩**：使用 SVGO 官方默认配置压缩 SVG 文件
- **单色转换**：将彩色 SVG 转换为单色版本，自动继承父元素颜色
- **批量处理**：支持同时处理多个 SVG 文件
- **智能识别**：自动识别 SVG 文件，过滤非 SVG 文件
- **配置支持**：支持项目级别的 SVGO 自定义配置文件
- **右键菜单**：集成到 VSCode 右键菜单，使用便捷

## 安装

### 从 VSCode 市场安装

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 `SVG Mono Compress`
4. 点击安装

### 本地安装（开发版本）

1. 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 `.vsix` 文件

## 使用方法

### 基本使用

1. 在vscode 资源管理器中右键一个 SVG 文件
2. 选择命令：
   - **压缩 SVG**
   - **压缩为单色 SVG**

### 批量处理

1. 选择多个 SVG 文件（按住 Ctrl 点击）
2. 右键选择压缩选项
3. 插件会自动处理所有选中的 SVG 文件

### 自定义 SVGO 配置

在项目根目录创建 `svgo.config.js`：

```js
module.exports = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
};
```

## 注意事项

- “压缩为单色 SVG”目标是生成可像字体图标一样使用的纯色 SVG。
- 转换后，多色、渐变、图案等复杂视觉效果可能被简化或移除。
- 更适合图标类素材，不适合需要保留复杂视觉层次的插画类 SVG。

## 开发与发布文档

开发、测试、打包和发布说明已移到 [development.md](./development.md)。

## 许可证

MIT License，详见 [LICENSE](./LICENSE)。

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)。
