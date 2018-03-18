const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'awezoom.js',
    library: 'Awezoom',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};