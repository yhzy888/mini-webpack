const path = require("path");
const resolve = function (target) {
  return path.resolve(__dirname, target);
}
module.exports = {
  entry: "./src/index.js",
  output: {
    path: resolve('./dist'),
    filename: 'main.js'
  },
  mode: 'development'
}