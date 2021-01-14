/**
 * External Dependencies
 */
const path = require( 'path' );

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
	target: 'node',
	entry: './app/index.js',
	devtool: 'source-map',
	node: {
		__dirname: false,
	},
	externals: {
		electron: 'commonjs electron',
		keytar: 'commonjs keytar',
	},
	resolve: {
		alias: {
			app: path.resolve( __dirname, 'app' ),
		},
	},
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop.js',
	},
	module: {
		rules: [
			// Needed to resolve dependency keytar
			{
				test: /\.node$/,
				loader: 'node-loader',
			},
		],
	},
	watch: isDevelopment,
	watchOptions: {
		ignored: /node_modules/,
	},
	mode: isDevelopment ? 'development' : 'production',
};
