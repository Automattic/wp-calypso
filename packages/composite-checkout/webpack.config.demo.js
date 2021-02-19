const path = require( 'path' );
const webpack = require( 'webpack' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );

module.exports = {
	entry: './packages/composite-checkout/demo/index.js',
	mode: 'development',
	module: {
		rules: [
			TranspileConfig.loader( {
				workerCount: 1,
				configFile: path.resolve( 'babel.config.js' ),
				exclude: /node_modules\//,
			} ),
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		alias: {
			'@automattic/composite-checkout': path.join( __dirname, 'src/public-api.ts' ),
		},
	},
	output: {
		path: path.resolve( __dirname, '/dist/' ),
		publicPath: '/dist/',
		filename: 'bundle.js',
	},
	devServer: {
		static: path.join( __dirname, '/demo/' ),
		port: 3000,
	},
	plugins: [ new webpack.HotModuleReplacementPlugin() ],
};
