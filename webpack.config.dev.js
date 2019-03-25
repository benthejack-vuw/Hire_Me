const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [path.join(__dirname, "src/index.js")],
  output: {
    path: path.join(__dirname, 'build/', 'scripts/'),
    filename: "let_me_grow_with_you.bundle.js"
  },

  module: {
    rules: [
       {
         test: /\.js$/,
         exclude: /(node_modules)/,
         use: {
           loader: 'babel-loader',
           options: {
             presets: ['@babel/preset-env']
           }
         }
       }
     ]
  },

  devtool: "inline-source-map",
  devServer: {
     publicPath: path.resolve(__dirname,'/build', '/scripts'),
     contentBase: path.resolve(__dirname, "build"),
     watchContentBase: true,
     compress: true,
     port: 9000,
  }

};
