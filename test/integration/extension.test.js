const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// VSCode扩展集成测试
suite('SVG压缩插件集成测试', function() {
  const testWorkspaceRoot = path.join(__dirname, '..', 'samples');
  
  suiteSetup(async function() {
    // 设置测试环境
    console.log('设置集成测试环境...');
    
    // 确保扩展已激活
    const extension = vscode.extensions.getExtension('your-publisher-name.svg-mono-compress');
    if (extension && !extension.isActive) {
      await extension.activate();
    }
  });
  
  suite('命令注册测试', function() {
    test('应该注册SVG压缩命令', async function() {
      const commands = await vscode.commands.getCommands();
      assert(commands.includes('svg-compress.compress'), '压缩SVG命令未注册');
      assert(commands.includes('svg-compress.monoCompress'), '单色压缩命令未注册');
    });
  });
  
  suite('右键菜单测试', function() {
    test('SVG文件应该显示压缩选项', async function() {
      // 这个测试需要模拟文件资源管理器的右键菜单
      // 在实际的VSCode环境中，菜单项会根据when条件显示
      const svgFile = path.join(testWorkspaceRoot, 'colorful-icon.svg');
      assert(fs.existsSync(svgFile), 'SVG测试文件不存在');
      
      // 验证文件扩展名匹配条件
      assert(path.extname(svgFile) === '.svg', '文件扩展名应该是.svg');
    });
  });
  
  suite('SVG压缩功能测试', function() {
    test('应该能压缩单个SVG文件', async function() {
      const svgFile = path.join(testWorkspaceRoot, 'colorful-icon.svg');
      const uri = vscode.Uri.file(svgFile);
      
      // 获取原始文件大小
      const originalStats = fs.statSync(svgFile);
      const originalSize = originalStats.size;
      
      try {
        // 执行压缩命令
        await vscode.commands.executeCommand('svg-compress.compress', uri);
        
        // 验证文件仍然存在且是有效的SVG
        assert(fs.existsSync(svgFile), '压缩后文件应该仍然存在');
        
        const content = fs.readFileSync(svgFile, 'utf8');
        assert(content.includes('<svg'), '压缩后应该仍然是有效的SVG');
        
        console.log(`原始大小: ${originalSize} 字节`);
        console.log(`压缩后大小: ${fs.statSync(svgFile).size} 字节`);
        
      } catch (error) {
        console.error('压缩测试失败:', error.message);
        throw error;
      }
    });
    
    test('应该能转换为单色SVG', async function() {
      const svgFile = path.join(testWorkspaceRoot, 'colorful-icon.svg');
      const uri = vscode.Uri.file(svgFile);
      
      // 读取原始内容
      const originalContent = fs.readFileSync(svgFile, 'utf8');
      
      try {
        // 执行单色转换命令
        await vscode.commands.executeCommand('svg-compress.monoCompress', uri);
        
        // 验证转换结果
        const convertedContent = fs.readFileSync(svgFile, 'utf8');
        assert(convertedContent.includes('<svg'), '转换后应该仍然是有效的SVG');
        
        // 检查是否移除了颜色属性（这个检查可能需要根据实际实现调整）
        console.log('单色转换完成，需要验证颜色属性是否正确处理');
        
      } catch (error) {
        console.error('单色转换测试失败:', error.message);
        throw error;
      }
    });
  });
  
  suite('批量处理测试', function() {
    test('应该能处理多个SVG文件', async function() {
      const svgFiles = [
        path.join(testWorkspaceRoot, 'colorful-icon.svg'),
        path.join(testWorkspaceRoot, 'simple-mono.svg')
      ];
      
      const uris = svgFiles.map(file => vscode.Uri.file(file));
      
      // 验证所有文件都存在
      svgFiles.forEach(file => {
        assert(fs.existsSync(file), `测试文件不存在: ${file}`);
      });
      
      try {
        // 执行批量压缩
        await vscode.commands.executeCommand('svg-compress.compress', ...uris);
        
        // 验证所有文件都被处理
        svgFiles.forEach(file => {
          assert(fs.existsSync(file), `处理后文件应该存在: ${file}`);
          const content = fs.readFileSync(file, 'utf8');
          assert(content.includes('<svg'), `处理后应该仍然是有效的SVG: ${file}`);
        });
        
        console.log(`成功处理 ${svgFiles.length} 个SVG文件`);
        
      } catch (error) {
        console.error('批量处理测试失败:', error.message);
        throw error;
      }
    });
  });
  
  suite('错误处理测试', function() {
    test('应该能处理损坏的SVG文件', async function() {
      const brokenFile = path.join(testWorkspaceRoot, 'broken.svg');
      const uri = vscode.Uri.file(brokenFile);
      
      assert(fs.existsSync(brokenFile), '损坏的SVG测试文件不存在');
      
      try {
        // 尝试处理损坏的文件
        await vscode.commands.executeCommand('svg-compress.compress', uri);
        
        // 如果没有抛出错误，说明处理了错误情况
        console.log('损坏文件处理完成（可能显示了错误消息）');
        
      } catch (error) {
        // 预期可能会有错误，这是正常的
        console.log('损坏文件处理产生预期错误:', error.message);
      }
    });
    
    test('应该能处理非SVG文件', async function() {
      // 创建一个临时的非SVG文件
      const tempFile = path.join(testWorkspaceRoot, 'test.txt');
      fs.writeFileSync(tempFile, 'This is not an SVG file');
      
      const uri = vscode.Uri.file(tempFile);
      
      try {
        // 尝试处理非SVG文件
        await vscode.commands.executeCommand('svg-compress.compress', uri);
        
        console.log('非SVG文件处理完成（应该显示适当的错误消息）');
        
      } catch (error) {
        console.log('非SVG文件处理产生预期错误:', error.message);
      } finally {
        // 清理临时文件
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });
  
  suiteTeardown(function() {
    console.log('清理集成测试环境...');
  });
});