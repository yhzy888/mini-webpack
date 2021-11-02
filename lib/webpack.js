// 使用node的核心模块，fs模块
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require("path");
const { transformFromAst } = require('@babel/core');

module.exports = class webpack{
  constructor(config) {
    // 传参做配置处理
    // console.log('config----', config);
    this.entry = config.entry;
    this.output = config.output;
    // 用来存储所有模块的信息
    this.modules = [];
  }
  run() {
    // 启动/入口函数
    // console.log('y-webpack-run');
    // 分析模块
    const moduleInfo = this.parse(this.entry);
    // console.log('moduleInfo:', moduleInfo);
    // 双层循环处理达到递归处理的目的
    this.modules.push(moduleInfo);
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const { depends } = item;
      if (depends) {
        for (let j in depends) {
          this.modules.push(this.parse(depends[j]));
        }
      }
    }
    // console.log('this.modules:', this.modules);
    // 数组转换成对象，方便boundle文件的生成
    // {
    //   "./src/y.js": { }
    // }
    const obj = {}
    this.modules.forEach((item) => {
      obj[item.modulePath] = {
        depends: item.depends,
        code: item.code,
      }
    });
    // console.log('obj:', obj);
    this.boundleFile(obj);
  }
  parse(modulePath) {
    // 分析模块的函数
    // console.log('modulePath', modulePath);
    // 读取模块的内容
    const content = fs.readFileSync(modulePath, "utf-8");
    // console.log('content--', content);
    // 使用 @babel/paser 进行js依赖的处理
    const ast = parser.parse(content, { sourceType: 'module' });
    // console.log('ast---', ast);
    // console.log('ast---program.body', ast.program.body);
    const depends = {}; // 依赖
    // @ts-ignore
    traverse(ast, {
      ImportDeclaration: function ({ node }) {
        // console.log('node----', node.source.value);
        // 处理依赖文件路径 ./y.js   ----> ./src/y/js
        // 注意： ./ 这样直接写在windows 下会有坑，windows 下的文件路径 .\xxx\xxxx
        const newPath = './' + path.join(path.dirname(modulePath), node.source.value);
        // console.log('newPath:', newPath);
        depends[node.source.value] = newPath;
      }
    });
    // console.log('depends:', depends);
    // @ts-ignore
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    });
    // console.log('code: ', code);
    return {
      modulePath,
      depends,
      code,
    }
  }
  boundleFile(obj) {
    // 生成 boundle 文件
    const filePath = path.join(this.output.path, this.output.filename);
    // console.log('filePath:', filePath);
    const str = JSON.stringify(obj);
    const content = `(function(modules){
      // webpackbootstrap
      // 填补函数 require exports
      function require(module){
        // module === './src/index.js'
        function pathRest(oldPath){
          // ./y.js ====> ./src/y.js
          return require(modules[module].depends[oldPath]);
        }
        const exports = {};
        (function(require, code){
          eval(code);
        })(pathRest, modules[module].code)
        return exports;
      }
      require('${this.entry}');
    })(${str})`;
    fs.writeFileSync(filePath, content, "utf-8");
    
    // 书写 boundle 内容

  }
}