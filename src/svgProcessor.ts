import { optimize, loadConfig, Config } from 'svgo';
import * as fs from 'fs';

/**
 * 压缩结果接口
 */
export interface CompressResult {
  success: boolean;
  filePath: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

/**
 * 处理结果接口
 */
export interface ProcessResult {
  results: CompressResult[];
  totalOriginalSize: number;
  totalCompressedSize: number;
  successCount: number;
  failedCount: number;
}

/**
 * SVG处理器 - 简化版本
 * 直接使用SVGO官方API
 */
export class SvgProcessor {
  /**
   * 压缩SVG文件
   * @param filePaths 文件路径或文件路径数组
   * @returns 处理结果
   */
  async compressSvg(filePaths: string | string[]): Promise<ProcessResult> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const svgPaths = this.filterSvgFiles(paths);

    // 使用SVGO官方loadConfig加载配置
    const config = await loadConfig() || {};

    const results: CompressResult[] = [];

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
  async convertToMono(filePaths: string | string[]): Promise<ProcessResult> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const svgPaths = this.filterSvgFiles(paths);

    // 在官方默认配置基础上额外去除颜色
    const baseConfig = await loadConfig() || {};
    const monoConfig: Config = {
      ...baseConfig,
      plugins: [
        ...(baseConfig.plugins || []),
        {
          name: 'removeAttrs',
          params: {
            attrs: ['fill', 'stroke']
          }
        }
      ]
    };

    const results: CompressResult[] = [];

    for (const filePath of svgPaths) {
      const result = await this.processSingleFile(filePath, monoConfig);
      results.push(result);
    }

    return this.calculateProcessResult(results);
  }

  /**
   * 过滤SVG文件（仅检查扩展名）
   */
  private filterSvgFiles(filePaths: string[]): string[] {
    return filePaths.filter(path => path.toLowerCase().endsWith('.svg'));
  }

  /**
   * 处理单个SVG文件
   */
  private async processSingleFile(filePath: string, config: Config): Promise<CompressResult> {
    try {
      // 读取文件
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const originalSize = Buffer.byteLength(content, 'utf-8');

      // 使用SVGO优化
      const result = optimize(content, config);

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
      } else {
        throw new Error('SVGO优化失败');
      }
    } catch (error) {
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
  private calculateProcessResult(results: CompressResult[]): ProcessResult {
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