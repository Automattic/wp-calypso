const path = require('path')

module.exports = {
  mode: 'production',
  context: path.join(__dirname, '/ui'),
  entry: [
    './main.js'
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
      }
    ]
  },
  output: {
    path: path.join(__dirname, '/ui'),
    filename: '[name].build.js'
  }
}
