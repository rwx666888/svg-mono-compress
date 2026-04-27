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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const svgProcessor_1 = require("./svgProcessor");
/**
 * 插件激活函数
 */
function activate(context) {
    console.log('SVG 压缩工具插件已激活');
    const svgProcessor = new svgProcessor_1.SvgProcessor();
    // 注册压缩 SVG 命令
    const compressCommand = vscode.commands.registerCommand('svg-compress.compress', async (uri, uris) => {
        await handleSvgCommand(uri, uris, (paths, onProgress) => svgProcessor.compressSvg(paths, onProgress), '压缩 SVG');
    });
    // 注册单色 SVG 转换命令
    const monoCompressCommand = vscode.commands.registerCommand('svg-compress.monoCompress', async (uri, uris) => {
        await handleSvgCommand(uri, uris, (paths, onProgress) => svgProcessor.convertToMono(paths, onProgress), '转换为单色 SVG');
    });
    context.subscriptions.push(compressCommand, monoCompressCommand);
}
// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * 处理 SVG 命令的通用函数
 */
async function handleSvgCommand(uri, uris, processor, operationName) {
    try {
        const filePaths = getSelectedFilePaths(uri, uris);
        if (filePaths.length === 0) {
            vscode.window.showWarningMessage('未选择任何 SVG 文件');
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `正在${operationName}...`,
            cancellable: false,
        }, async (progress) => {
            const total = filePaths.length;
            // 初始进度
            progress.report({ increment: 0, message: `共 ${total} 个文件` });
            let lastPercent = 0;
            const result = await processor(filePaths.length === 1 ? filePaths[0] : filePaths, (completed, total) => {
                const percent = Math.round((completed / total) * 100);
                const increment = percent - lastPercent;
                lastPercent = percent;
                progress.report({
                    increment,
                    message: `${completed} / ${total} 个文件`,
                });
            });
            showProcessResult(result, operationName);
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${operationName}失败: ${errorMessage}`);
    }
}
/**
 * 获取选中的文件路径（仅保留 .svg 文件）
 */
function getSelectedFilePaths(uri, uris) {
    const allUris = uris && uris.length > 0 ? uris : (uri ? [uri] : []);
    return allUris
        .filter(u => u && u.fsPath)
        .map(u => u.fsPath)
        .filter(path => path.toLowerCase().endsWith('.svg'));
}
/**
 * 显示处理结果
 *
 * 使用 Output Channel 输出详细报告（取代多行 showInformationMessage），
 * 通知气泡只展示摘要，避免长文本被截断。
 */
function showProcessResult(result, operationName) {
    const { results, totalOriginalSize, totalCompressedSize, successCount, failedCount } = result;
    if (successCount === 0) {
        vscode.window.showErrorMessage(`${operationName}失败：没有文件被成功处理`);
        writeToOutputChannel(operationName, result);
        return;
    }
    const totalCompressionRatio = totalOriginalSize > 0
        ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
        : '0';
    // 通知气泡：简洁摘要
    let summary = `${operationName}完成！成功 ${successCount} 个文件`;
    if (failedCount > 0) {
        summary += `，失败 ${failedCount} 个`;
    }
    summary += `，压缩率 ${totalCompressionRatio}%`;
    summary += `（${formatSize(totalOriginalSize)} → ${formatSize(totalCompressedSize)}）`;
    if (failedCount > 0) {
        vscode.window.showWarningMessage(summary, '查看详情').then(selection => {
            if (selection === '查看详情') {
                writeToOutputChannel(operationName, result, true);
            }
        });
    }
    else {
        vscode.window.showInformationMessage(summary);
    }
    // 成功时也写入 Output Channel，方便用户事后查看
    writeToOutputChannel(operationName, result);
}
/**
 * 将处理结果详情写入 Output Channel
 * @param focusOnErrors 是否聚焦到 Output Channel（有错误时使用）
 */
function writeToOutputChannel(operationName, result, focusOnErrors = false) {
    const channel = getOutputChannel();
    const { results, totalOriginalSize, totalCompressedSize, successCount, failedCount } = result;
    const totalCompressionRatio = totalOriginalSize > 0
        ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
        : '0';
    const separator = '─'.repeat(60);
    const timestamp = new Date().toLocaleTimeString();
    channel.appendLine('');
    channel.appendLine(separator);
    channel.appendLine(`[${timestamp}] ${operationName}`);
    channel.appendLine(separator);
    channel.appendLine(`汇总：成功 ${successCount} / 共 ${results.length} 个文件` +
        (failedCount > 0 ? `，失败 ${failedCount} 个` : ''));
    channel.appendLine(`大小：${formatSize(totalOriginalSize)} → ${formatSize(totalCompressedSize)}` +
        `（节省 ${totalCompressionRatio}%）`);
    channel.appendLine('');
    // 成功文件明细
    const succeeded = results.filter(r => r.success);
    if (succeeded.length > 0) {
        channel.appendLine('成功文件：');
        for (const r of succeeded) {
            const ratio = r.originalSize > 0
                ? ((r.originalSize - r.compressedSize) / r.originalSize * 100).toFixed(1)
                : '0';
            channel.appendLine(`  ✓  ${r.filePath}` +
                `  ${formatSize(r.originalSize)} → ${formatSize(r.compressedSize)}` +
                `  (-${ratio}%)`);
        }
    }
    // 失败文件明细
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        channel.appendLine('');
        channel.appendLine('失败文件：');
        for (const r of failed) {
            channel.appendLine(`  ✗  ${r.filePath}`);
            channel.appendLine(`       错误：${r.error}`);
        }
    }
    if (focusOnErrors) {
        channel.show(true);
    }
}
/** Output Channel 单例 */
let _outputChannel;
function getOutputChannel() {
    if (!_outputChannel) {
        _outputChannel = vscode.window.createOutputChannel('SVG 压缩工具');
    }
    return _outputChannel;
}
/**
 * 格式化文件大小
 */
function formatSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
/**
 * 插件停用函数
 */
function deactivate() {
    _outputChannel?.dispose();
    console.log('SVG 压缩工具插件已停用');
}
//# sourceMappingURL=extension.js.map