const path = require('path')

const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const MiniExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  context: path.join(__dirname, '/docs-source'),
  entry: {
    /* eslint-disable quote-props */
    'page': './stylesheets/page.scss',
    'page-custom': './javascripts/page-custom.js',
    'page-index': './javascripts/page-index.js'
    /* eslint-enable quote-props */
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
    path: path.join(__dirname, '/docs/assets'),
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
