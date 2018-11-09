const path = require('path')

const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const MiniExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  context: path.join(__dirname, '/docs-source'),
  entry: {
    custom: './javascripts/custom.js',
    index: './javascripts/index.js',
    main: './stylesheets/main.scss'
  },
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
          {
            loader: MiniExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                return [
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed'
            }
          }
        ]
      },
      {
        test: /\.sketchpalette$/,
        use: 'raw-loader'
      }
    ]
  },
  output: {
    path: path.join(__dirname, '/docs/build'),
    filename: '[name].js'
  },
  plugins: [
    new MiniExtractPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new ExtraneousFileCleanupPlugin({
      extensions: [
        '.js'
      ]
    })
  ]
}
