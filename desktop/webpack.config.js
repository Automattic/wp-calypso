/**
 * External Dependencies
 */
const path = require( 'path' );
const { DefinePlugin } = require( 'webpack' );
const CopyPlugin = require( 'copy-webpack-plugin' );

const DEVELOPMENT = process.env.NODE_ENV === 'development';

module.exports = {
	context: path.resolve( __dirname, 'app' ),
	output: {
		path: path.join( __dirname, 'dist' ),
		filename: 'index.js',
		libraryTarget: 'commonjs2',
	},
	plugins: [
		new CopyPlugin( {
			patterns: [
				{
					from: path.join( __dirname, 'public_desktop' ),
					to: path.join( 'public_desktop' ),
				},
			],
		} ),
		new DefinePlugin( {
			__public: `"${ path.join( __dirname, 'public_desktop' ).replace( /\\/g, '\\\\' ) }"`,
		} ),
	],
	entry: './index.js',
	watch: DEVELOPMENT,
	watchOptions: {
		ignored: /node_modules/,
	},
	target: 'electron-main',
	devtool: 'inline-cheap-source-map',
	node: {
		__filename: true,
		__dirname: false,
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		modules: [ 'node_modules' ],
	},
	externals: [ 'keytar', 'superagent', 'ws' ],
	mode: DEVELOPMENT ? 'development' : 'production',
};
