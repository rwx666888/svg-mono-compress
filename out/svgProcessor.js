"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgProcessor = void 0;
const svgo_1 = require("svgo");
const fs = __importStar(require("fs"));
/**
 * SVG处理器 - 简化版本
 * 直接使用SVGO官方API
 */
class SvgProcessor {
    /**
     * 压缩SVG文件
     * @param filePaths 文件路径或文件路径数组
     * @returns 处理结果
     */
    async compressSvg(filePaths) {
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
        const svgPaths = this.filterSvgFiles(paths);
        // 使用SVGO官方loadConfig加载配置
        const config = await (0, svgo_1.loadConfig)() || {};
        const results = [];
        for (const filePath of svgPaths) {
            const result = await this.processSingleFile(filePath, config);
            results.push(result);
        }
        return this.calculateProcessResult(results);
    }
    /**
     * 转换为单色SVG
     * @param filePaths 文件路径或文件路径数组
     * @returns 处理结果
     */
    async convertToMono(filePaths) {
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
        const svgPaths = this.filterSvgFiles(paths);
        const results = [];
        for (const filePath of svgPaths) {
            const result = await this.processMonoFile(filePath);
            results.push(result);
        }
        return this.calculateProcessResult(results);
    }
    /**
     * 过滤SVG文件（仅检查扩展名）
     */
    filterSvgFiles(filePaths) {
        return filePaths.filter(path => path.toLowerCase().endsWith('.svg'));
    }
    /**
     * 处理单色SVG文件
     * 先执行默认压缩，然后将颜色属性替换为currentColor
     */
    async processMonoFile(filePath) {
        try {
            // 读取文件
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const originalSize = Buffer.byteLength(content, 'utf-8');
            // 第一步：使用默认配置压缩
            const baseConfig = await (0, svgo_1.loadConfig)() || {};
            const compressResult = (0, svgo_1.optimize)(content, baseConfig);
            if (!('data' in compressResult)) {
                throw new Error('SVGO压缩失败');
            }
            // 第二步：将颜色属性替换为currentColor
            const monoConfig = {
                plugins: [
                    {
                        name: 'replaceColorWithCurrentColor',
                        fn: () => {
                            return {
                                element: {
                                    enter: (node) => {
                                        if (node.attributes) {
                                            // 替换fill属性
                                            if (node.attributes.fill && node.attributes.fill !== 'none' && node.attributes.fill !== 'currentColor') {
                                                node.attributes.fill = 'currentColor';
                                            }
                                            // 替换stroke属性
                                            if (node.attributes.stroke && node.attributes.stroke !== 'none' && node.attributes.stroke !== 'currentColor') {
                                                node.attributes.stroke = 'currentColor';
                                            }
                                        }
                                    }
                                }
                            };
                        }
                    }
                ]
            };
            // 应用单色转换
            const monoResult = (0, svgo_1.optimize)(compressResult.data, monoConfig);
            if ('data' in monoResult) {
                // 写入最终结果
                await fs.promises.writeFile(filePath, monoResult.data, 'utf-8');
                const compressedSize = Buffer.byteLength(monoResult.data, 'utf-8');
                const compressionRatio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;
                return {
                    success: true,
                    filePath,
                    originalSize,
                    compressedSize,
                    compressionRatio
                };
            }
            else {
                throw new Error('单色转换失败');
            }
        }
        catch (error) {
            return {
                success: false,
                filePath,
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 0,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * 处理单个SVG文件
     */
    async processSingleFile(filePath, config) {
        try {
            // 读取文件
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const originalSize = Buffer.byteLength(content, 'utf-8');
            // 使用SVGO优化
            const result = (0, svgo_1.optimize)(content, config);
            if ('data' in result) {
                // 写入优化后的内容
                await fs.promises.writeFile(filePath, result.data, 'utf-8');
                const compressedSize = Buffer.byteLength(result.data, 'utf-8');
                const compressionRatio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;
                return {
                    success: true,
                    filePath,
                    originalSize,
                    compressedSize,
                    compressionRatio
                };
            }
            else {
                throw new Error('SVGO优化失败');
            }
        }
        catch (error) {
            return {
                success: false,
                filePath,
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 0,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * 计算处理结果统计
     */
    calculateProcessResult(results) {
        const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;
        return {
            results,
            totalOriginalSize,
            totalCompressedSize,
            successCount,
            failedCount
        };
    }
}
exports.SvgProcessor = SvgProcessor;
//# sourceMappingURL=svgProcessor.js.map