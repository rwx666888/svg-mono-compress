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
 * SVG 处理器
 */
class SvgProcessor {
    /**
     * 压缩 SVG 文件
     * @param filePaths 文件路径或文件路径数组
     * @param onProgress 进度回调，参数为 (已完成数, 总数)
     */
    async compressSvg(filePaths, onProgress) {
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
        const svgPaths = this.filterSvgFiles(paths);
        const config = await (0, svgo_1.loadConfig)() || {};
        const results = [];
        for (let i = 0; i < svgPaths.length; i++) {
            const result = await this.processSingleFile(svgPaths[i], config);
            results.push(result);
            onProgress?.(i + 1, svgPaths.length);
        }
        return this.calculateProcessResult(results);
    }
    /**
     * 转换为单色 SVG（可像字体 icon 一样通过 CSS color 控制颜色）
     *
     * 处理策略：
     *   Step 1 - 基础压缩（去注释、合并路径等，不动颜色）
     *   Step 2 - 字符串层面删除 linearGradient / radialGradient / pattern 定义，
     *            清理 <style> 块和 style attribute 中的颜色声明
     *            【注意：opacity / fill-opacity / stroke-opacity 保留，不做清理】
     *   Step 3 - SVGO 单色化：convertStyleToAttrs → removeAttrs（仅清除颜色属性，
     *            不含 opacity 类） → removeStyleElement
     *            → addAttributesToSVGElement（根 svg 同时注入
     *              fill="currentColor" 和 stroke="currentColor"）
     *   Step 4 - 二次 removeAttrs，清理 convertStyleToAttrs 转出的颜色属性
     *   Step 5 - 最终兜底：确保根 svg 上有 fill="currentColor" stroke="currentColor"
     *
     * 关于 opacity 保留的原因：
     *   fill-opacity / stroke-opacity / opacity 控制的是透明度层级，
     *   与颜色本身无关。单色化只需要让颜色跟随 CSS color 变化，
     *   透明度（阴影层级、半透明镂空等视觉效果）应当保留。
     *
     * 关于同时注入 fill + stroke 的原因：
     *   heroicons outline、Phosphor 等图标库是纯 stroke 图标，
     *   子元素上 stroke 被删除后必须从根元素继承，
     *   如果根元素只有 fill="currentColor" 而没有 stroke="currentColor"，
     *   outline 图标的线条颜色会完全丢失。
     *
     * @param filePaths 文件路径或文件路径数组
     * @param onProgress 进度回调，参数为 (已完成数, 总数)
     */
    async convertToMono(filePaths, onProgress) {
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
        const svgPaths = this.filterSvgFiles(paths);
        const results = [];
        for (let i = 0; i < svgPaths.length; i++) {
            const result = await this.processMonoFile(svgPaths[i]);
            results.push(result);
            onProgress?.(i + 1, svgPaths.length);
        }
        return this.calculateProcessResult(results);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────
    filterSvgFiles(filePaths) {
        return filePaths.filter(path => path.toLowerCase().endsWith('.svg'));
    }
    async processSingleFile(filePath, config) {
        let originalSize = 0;
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            originalSize = Buffer.byteLength(content, 'utf-8');
            const result = (0, svgo_1.optimize)(content, config);
            if (!('data' in result)) {
                throw new Error('SVGO 优化失败，未返回有效数据');
            }
            await fs.promises.writeFile(filePath, result.data, 'utf-8');
            const compressedSize = Buffer.byteLength(result.data, 'utf-8');
            const compressionRatio = originalSize > 0
                ? (originalSize - compressedSize) / originalSize
                : 0;
            return { success: true, filePath, originalSize, compressedSize, compressionRatio };
        }
        catch (error) {
            return {
                success: false,
                filePath,
                originalSize,
                compressedSize: 0,
                compressionRatio: 0,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async processMonoFile(filePath) {
        let originalSize = 0;
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            originalSize = Buffer.byteLength(content, 'utf-8');
            // ── Step 1: 基础压缩（不改变颜色语义）─────────────────────────────
            const baseConfig = {
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                                convertColors: false,
                                removeUnknownsAndDefaults: false,
                            },
                        },
                    },
                ],
            };
            const step1Result = (0, svgo_1.optimize)(content, baseConfig);
            if (!('data' in step1Result)) {
                throw new Error('Step 1 基础压缩失败');
            }
            // ── Step 2: 字符串层面清理渐变定义和内联颜色 ──────────────────────
            // opacity / fill-opacity / stroke-opacity 不在清理范围内，予以保留
            const step2Data = this.stripGradientsAndColorStyles(step1Result.data);
            // ── Step 3: SVGO 单色化 ────────────────────────────────────────────
            const monoConfig = {
                plugins: [
                    // 3-a: 把 style attribute 中的声明转为独立 attribute，方便 removeAttrs 清理
                    { name: 'convertStyleToAttrs' },
                    // 3-b: 批量删除子元素的颜色 attribute
                    //      【重要】不含 opacity / fill-opacity / stroke-opacity，
                    //      透明度属性与颜色无关，删掉会破坏阴影层级和半透明镂空效果
                    {
                        name: 'removeAttrs',
                        params: {
                            attrs: [
                                'fill',
                                'stroke',
                                'color',
                                'stop-color',
                            ],
                        },
                    },
                    // 3-c: 删除 <style> 块（Step 2 已清理内容，此处整块移除）
                    { name: 'removeStyleElement' },
                    // 3-d: 在根 <svg> 上同时注入 fill="currentColor" 和 stroke="currentColor"
                    //      同时注入的原因：
                    //      - fill-only icon（如 solid 风格）：依赖 fill 继承
                    //      - stroke-only icon（如 heroicons outline、Phosphor）：依赖 stroke 继承
                    //      - 混合 icon：两者都需要
                    //      只注入 fill 会导致 outline 图标线条颜色完全丢失。
                    {
                        name: 'addAttributesToSVGElement',
                        params: {
                            attributes: [
                                { fill: 'currentColor' },
                                { stroke: 'currentColor' },
                            ],
                        },
                    },
                ],
            };
            const step3Result = (0, svgo_1.optimize)(step2Data, monoConfig);
            if (!('data' in step3Result)) {
                throw new Error('Step 3 单色化失败');
            }
            // ── Step 4: 二次 removeAttrs，清理 convertStyleToAttrs 转出的颜色属性 ─
            // 同样不含 opacity 类属性
            const step4Config = {
                plugins: [
                    {
                        name: 'removeAttrs',
                        params: {
                            attrs: [
                                'fill',
                                'stroke',
                                'color',
                                'stop-color',
                            ],
                        },
                    },
                ],
            };
            const step4Result = (0, svgo_1.optimize)(step3Result.data, step4Config);
            if (!('data' in step4Result)) {
                throw new Error('Step 4 二次清理失败');
            }
            // ── Step 5: 最终兜底，确保根 <svg> 上有 fill 和 stroke currentColor ─
            // removeAttrs 不区分根元素和子元素，Step 3-d 注入的属性会被 Step 4 删掉，
            // 此步在字符串层面重新补上。
            const finalData = this.ensureRootCurrentColor(step4Result.data);
            await fs.promises.writeFile(filePath, finalData, 'utf-8');
            const compressedSize = Buffer.byteLength(finalData, 'utf-8');
            const compressionRatio = originalSize > 0
                ? (originalSize - compressedSize) / originalSize
                : 0;
            return { success: true, filePath, originalSize, compressedSize, compressionRatio };
        }
        catch (error) {
            return {
                success: false,
                filePath,
                originalSize,
                compressedSize: 0,
                compressionRatio: 0,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * 字符串层面：
     *   1. 删除 linearGradient / radialGradient / pattern 元素定义
     *   2. 清理 <style> 块中的颜色相关 CSS 属性（fill / stroke / color / stop-color）
     *   3. 清理 style attribute 中的颜色声明
     *
     * 【不处理 opacity / fill-opacity / stroke-opacity】
     * 透明度控制的是视觉层级（半透明镂空、阴影效果），
     * 单色化只需要颜色跟随 CSS color，透明度应当保留。
     */
    stripGradientsAndColorStyles(svgContent) {
        let result = svgContent;
        // 1. 删除渐变 / pattern 元素（含子节点）
        result = result.replace(/<(linearGradient|radialGradient|pattern)(\s[^>]*)?>[\s\S]*?<\/\1>/gi, '');
        // 自闭合形式
        result = result.replace(/<(linearGradient|radialGradient|pattern)(\s[^>]*)?\/>/gi, '');
        // 2. 清理 <style> 块中的颜色属性
        //    仅清理 fill / stroke / color / stop-color，保留 opacity 类
        result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, cssContent) => {
            const cleaned = cssContent
                .replace(/\bfill\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bstroke\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bcolor\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bstop-color\s*:\s*[^;}"']+;?/gi, '');
            // style 块清空后整体移除，否则保留（可能还有 font-size 等非颜色属性）
            return cleaned.trim() ? `<style>${cleaned}</style>` : '';
        });
        // 3. 清理 style attribute 中的颜色声明（如 style="fill:#f00;font-size:12px"）
        //    同样只清理颜色，不动 opacity 类
        result = result.replace(/\bstyle="([^"]*)"/gi, (_match, styleValue) => {
            const cleaned = styleValue
                .replace(/\bfill\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bstroke\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bcolor\s*:\s*[^;}"']+;?/gi, '')
                .replace(/\bstop-color\s*:\s*[^;}"']+;?/gi, '')
                .trim()
                .replace(/;+$/, '');
            return cleaned ? `style="${cleaned}"` : '';
        });
        return result;
    }
    /**
     * 确保根 <svg> 元素上同时有 fill="currentColor" 和 stroke="currentColor"。
     *
     * 背景：removeAttrs 不区分根元素和子元素，会把
     * addAttributesToSVGElement 在 Step 3 注入的属性也删掉。
     * 此函数在最终输出前做字符串层面的兜底补充。
     *
     * 必须同时注入 fill 和 stroke 的原因：
     *   - fill 控制实心图标（solid 风格）的颜色继承
     *   - stroke 控制描边图标（outline 风格，如 heroicons outline）的颜色继承
     *   - 只注入 fill 会导致 stroke-only 图标线条颜色完全丢失
     */
    ensureRootCurrentColor(svgContent) {
        // 找到根 svg 开标签（第一个 <svg ...>）
        return svgContent.replace(/^(<svg\b[^>]*?)(\s*\/?>)/, (_match, tagBody, closing) => {
            let result = tagBody;
            // 处理 fill
            if (/\bfill="currentColor"/.test(result)) {
                // 已有，不动
            }
            else if (/\bfill=/.test(result)) {
                // 有其他值，替换
                result = result.replace(/\bfill="[^"]*"/, 'fill="currentColor"');
            }
            else {
                // 没有，追加
                result += ' fill="currentColor"';
            }
            // 处理 stroke
            if (/\bstroke="currentColor"/.test(result)) {
                // 已有，不动
            }
            else if (/\bstroke=/.test(result)) {
                // 有其他值，替换
                result = result.replace(/\bstroke="[^"]*"/, 'stroke="currentColor"');
            }
            else {
                // 没有，追加
                result += ' stroke="currentColor"';
            }
            return result + closing;
        });
    }
    /**
     * 计算处理结果统计。
     *
     * 失败文件的 compressedSize 视为等于 originalSize（即"未压缩"），
     * 保持分母一致，避免总体压缩率失真。
     */
    calculateProcessResult(results) {
        const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = results.reduce((sum, r) => sum + (r.success ? r.compressedSize : r.originalSize), 0);
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;
        return {
            results,
            totalOriginalSize,
            totalCompressedSize,
            successCount,
            failedCount,
        };
    }
}
exports.SvgProcessor = SvgProcessor;
//# sourceMappingURL=svgProcessor.js.map