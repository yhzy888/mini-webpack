(function(modules){
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
      require('./src/index.js');
    })({"./src/index.js":{"depends":{"./y.js":"./src/y.js"},"code":"\"use strict\";\n\nvar _y = require(\"./y.js\");\n\nconsole.log('userName: ', _y.y);"},"./src/y.js":{"depends":{"./h.js":"./src/h.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.y = void 0;\n\nvar _h = require(\"./h.js\");\n\nvar y = 'yu' + _h.h;\nexports.y = y;"},"./src/h.js":{"depends":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.h = void 0;\nvar h = 'hong';\nexports.h = h;"}})