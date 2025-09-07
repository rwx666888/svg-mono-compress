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
    console.log('SVG压缩工具插件已激活');
    const svgProcessor = new svgProcessor_1.SvgProcessor();
    // 注册压缩SVG命令
    const compressCommand = vscode.commands.registerCommand('svg-compress.compress', async (uri, uris) => {
        await handleSvgCommand(uri, uris, svgProcessor.compressSvg.bind(svgProcessor), '压缩SVG');
    });
    // 注册单色SVG转换命令
    const monoCompressCommand = vscode.commands.registerCommand('svg-compress.monoCompress', async (uri, uris) => {
        await handleSvgCommand(uri, uris, svgProcessor.convertToMono.bind(svgProcessor), '转换为单色SVG');
    });
    // 将命令添加到订阅列表
    context.subscriptions.push(compressCommand, monoCompressCommand);
}
/**
 * 处理SVG命令的通用函数
 */
async function handleSvgCommand(uri, uris, processor, operationName) {
    try {
        // 获取选中的文件路径
        const filePaths = getSelectedFilePaths(uri, uris);
        if (filePaths.length === 0) {
            vscode.window.showWarningMessage('未选择任何SVG文件');
            return;
        }
        // 显示进度提示
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `正在${operationName}...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: `处理 ${filePaths.length} 个文件` });
            // 执行处理
            const result = await processor(filePaths.length === 1 ? filePaths[0] : filePaths);
            progress.report({ increment: 100, message: '完成' });
            // 显示结果
            showProcessResult(result, operationName);
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${operationName}失败: ${errorMessage}`);
    }
}
/**
 * 获取选中的文件路径
 */
function getSelectedFilePaths(uri, uris) {
    const allUris = uris && uris.length > 0 ? uris : [uri];
    return allUris
        .filter(u => u && u.fsPath)
        .map(u => u.fsPath)
        .filter(path => path.toLowerCase().endsWith('.svg'));
}
/**
 * 显示处理结果
 */
function showProcessResult(result, operationName) {
    const { results, totalOriginalSize, totalCompressedSize, successCount, failedCount } = result;
    if (successCount === 0) {
        vscode.window.showErrorMessage(`${operationName}失败: 没有文件被成功处理`);
        return;
    }
    // 计算总体压缩率
    const totalCompressionRatio = totalOriginalSize > 0
        ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
        : '0';
    // 格式化文件大小
    const formatSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes}B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };
    let message = `${operationName}完成!\n`;
    message += `成功: ${successCount}个文件`;
    if (failedCount > 0) {
        message += `, 失败: ${failedCount}个文件`;
    }
    message += `\n原始大小: ${formatSize(totalOriginalSize)}`;
    message += `\n处理后大小: ${formatSize(totalCompressedSize)}`;
    message += `\n压缩率: ${totalCompressionRatio}%`;
    // 如果有失败的文件，显示详细信息
    if (failedCount > 0) {
        const failedFiles = results
            .filter(r => !r.success)
            .map(r => `${r.filePath}: ${r.error}`)
            .join('\n');
        vscode.window.showWarningMessage(message, '查看详情').then(selection => {
            if (selection === '查看详情') {
                vscode.window.showInformationMessage(`失败的文件:\n${failedFiles}`);
            }
        });
    }
    else {
        vscode.window.showInformationMessage(message);
    }
}
/**
 * 插件停用函数
 */
function deactivate() {
    console.log('SVG压缩工具插件已停用');
}
//# sourceMappingURL=extension.js.map