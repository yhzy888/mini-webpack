// 做引入webpack，启动webpack做打包处理
const webpack = require("./lib/webpack.js");
const config = require("./webpack.config.js");
new webpack(config).run();