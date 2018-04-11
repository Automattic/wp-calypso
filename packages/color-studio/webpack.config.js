const path = require('path')

const MiniExtractPlugin = require('mini-css-extract-plugin')
const OptimizeAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  mode: 'production',
  context: path.join(__dirname, '/ui'),
  entry: [
    './javascripts/main.js',
    './stylesheets/main.scss'
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.join(__dirname, '/node_modules'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env'
            ],
            plugins: [
              'transform-runtime'
            ]
          }
        }
      },
      {
        test: /\.scss$/,
        exclude: path.join(__dirname, '/node_modules'),
        use: [
          MiniExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, '/ui/build'),
    filename: '[name].js'
  },
  plugins: [
    new MiniExtractPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new OptimizeAssetsPlugin({
      cssProcessor: require('cssnano')
    })
  ]
}
