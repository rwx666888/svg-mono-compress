# Changelog

All notable changes to the "SVG Mono Compress" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 计划添加更多SVG优化选项
- 计划支持自定义压缩配置界面

### Changed
- 计划优化批量处理性能

## [1.0.0] - 2024-01-15

### Added
- 初始版本发布
- SVG文件右键菜单集成
- 基于SVGO 4.0+的SVG压缩功能
- 单色SVG转换功能（移除颜色属性，保留currentColor继承）
- 批量SVG文件处理支持
- 智能SVG文件识别（基于.svg扩展名）
- 自动加载项目中的SVGO配置文件支持
- 压缩结果统计和用户反馈
- 完整的错误处理机制
- TypeScript 5.x支持
- 单元测试和集成测试框架

### Technical Details
- 使用SVGO官方`loadConfig()`API加载配置
- 支持SVGO官方批量处理模式
- 基于VSCode Extension API开发
- 遵循语义化版本控制

### Features
- **SVG压缩**: 使用SVGO官方默认配置进行SVG文件压缩
- **单色转换**: 在默认压缩基础上移除所有颜色属性，保留currentColor以继承父元素颜色
- **批量处理**: 支持选择多个SVG文件进行批量压缩操作
- **智能识别**: 自动识别.svg文件，过滤非SVG文件
- **配置支持**: 自动检测并使用项目中的SVGO配置文件
- **用户体验**: 提供详细的处理结果反馈和错误提示

### Commands
- `svg-mono-compress.compressSvg`: 压缩选中的SVG文件
- `svg-mono-compress.compressToMono`: 压缩并转换为单色SVG文件

### Menu Integration
- 右键菜单项："压缩SVG"
- 右键菜单项："压缩为单色SVG"
- 仅在选择.svg文件时显示菜单项

### Dependencies
- svgo: ^4.0.0
- @types/vscode: ^1.74.0
- typescript: ^5.0.0

---

## Development Notes

### Version History
- 项目基于SVGO 4.0+版本开发
- 遵循VSCode扩展开发最佳实践
- 使用官方SVGO API，避免重复实现
- 简化架构设计，专注核心功能

### Future Roadmap
- [ ] 添加更多SVG优化选项
- [ ] 支持自定义压缩配置界面
- [ ] 优化大文件批量处理性能
- [ ] 添加压缩前后对比预览
- [ ] 支持更多输出格式选项

### Contributing
欢迎提交Issue和Pull Request来改进这个扩展。

### License
MIT License - 详见LICENSE文件