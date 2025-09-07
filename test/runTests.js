const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * 测试运行器
 * 用于执行VSCode插件的单元测试和集成测试
 */
class TestRunner {
  constructor() {
    this.testDir = __dirname;
    this.projectRoot = path.dirname(this.testDir);
  }
  
  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log('\n=== 运行单元测试 ===');
    
    const unitTestFile = path.join(this.testDir, 'unit', 'svgProcessor.test.js');
    
    if (!fs.existsSync(unitTestFile)) {
      console.error('单元测试文件不存在:', unitTestFile);
      return false;
    }
    
    try {
      // 使用Node.js直接运行单元测试
      const result = await this.runCommand('node', [unitTestFile]);
      console.log('单元测试完成');
      return result;
    } catch (error) {
      console.error('单元测试失败:', error.message);
      return false;
    }
  }
  
  /**
   * 运行集成测试（需要VSCode环境）
   */
  async runIntegrationTests() {
    console.log('\n=== 运行集成测试 ===');
    console.log('注意：集成测试需要在VSCode环境中运行');
    console.log('请使用以下命令在VSCode中运行集成测试：');
    console.log('1. 打开VSCode');
    console.log('2. 按F5启动扩展开发主机');
    console.log('3. 在扩展开发主机中按Ctrl+Shift+P');
    console.log('4. 运行"Developer: Reload Window"');
    console.log('5. 按Ctrl+Shift+P，运行"Test: Run All Tests"');
    
    return true;
  }
  
  /**
   * 验证测试环境
   */
  validateTestEnvironment() {
    console.log('=== 验证测试环境 ===');
    
    const requiredFiles = [
      path.join(this.projectRoot, 'package.json'),
      path.join(this.projectRoot, 'tsconfig.json'),
      path.join(this.testDir, 'samples', 'colorful-icon.svg'),
      path.join(this.testDir, 'samples', 'simple-mono.svg'),
      path.join(this.testDir, 'unit', 'svgProcessor.test.js'),
      path.join(this.testDir, 'integration', 'extension.test.js')
    ];
    
    let allValid = true;
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log('✓', path.relative(this.projectRoot, file));
      } else {
        console.log('✗', path.relative(this.projectRoot, file), '(缺失)');
        allValid = false;
      }
    });
    
    // 检查Node.js和npm
    console.log('\n检查开发环境:');
    try {
      const nodeVersion = require('child_process').execSync('node --version', { encoding: 'utf8' }).trim();
      console.log('✓ Node.js:', nodeVersion);
    } catch (error) {
      console.log('✗ Node.js 未安装或不可用');
      allValid = false;
    }
    
    try {
      const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log('✓ npm:', npmVersion);
    } catch (error) {
      console.log('✗ npm 未安装或不可用');
      allValid = false;
    }
    
    return allValid;
  }
  
  /**
   * 运行命令
   */
  runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  /**
   * 显示测试指南
   */
  showTestGuide() {
    console.log('\n=== VSCode插件测试指南 ===');
    console.log('\n1. 开发环境测试:');
    console.log('   - 按F5启动扩展开发主机');
    console.log('   - 在新窗口中测试插件功能');
    console.log('   - 右键点击SVG文件查看菜单选项');
    
    console.log('\n2. 功能测试:');
    console.log('   - 单文件压缩：右键SVG文件 → "压缩SVG"');
    console.log('   - 单色转换：右键SVG文件 → "转换为单色SVG"');
    console.log('   - 批量处理：选择多个SVG文件 → 右键 → 选择操作');
    
    console.log('\n3. 测试用例:');
    console.log('   - test/samples/colorful-icon.svg - 彩色图标测试');
    console.log('   - test/samples/complex-gradient.svg - 复杂渐变测试');
    console.log('   - test/samples/simple-mono.svg - 单色图标测试');
    console.log('   - test/samples/large-file.svg - 大文件性能测试');
    console.log('   - test/samples/broken.svg - 错误处理测试');
    
    console.log('\n4. 预期结果:');
    console.log('   - 文件大小应该减小');
    console.log('   - 单色转换应该移除颜色属性');
    console.log('   - 错误文件应该显示适当的错误消息');
    console.log('   - 处理完成后应该显示成功消息');
    
    console.log('\n5. 打包测试:');
    console.log('   - 运行 "npm run compile" 编译TypeScript');
    console.log('   - 运行 "vsce package" 打包插件');
    console.log('   - 安装.vsix文件测试发布版本');
  }
}

// 主函数
async function main() {
  const runner = new TestRunner();
  
  console.log('VSCode SVG压缩插件测试运行器');
  console.log('=====================================');
  
  // 验证测试环境
  if (!runner.validateTestEnvironment()) {
    console.error('\n测试环境验证失败，请检查缺失的文件和依赖');
    process.exit(1);
  }
  
  console.log('\n测试环境验证通过！');
  
  // 运行单元测试
  await runner.runUnitTests();
  
  // 显示集成测试指南
  await runner.runIntegrationTests();
  
  // 显示完整测试指南
  runner.showTestGuide();
  
  console.log('\n测试运行器执行完成！');
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error('测试运行器执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = TestRunner;