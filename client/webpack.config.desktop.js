/* eslint import/no-extraneous-dependencies: [ "error", { packageDir: __dirname/.. } ] */

/**
 * External Dependencies
 */
const path = require( 'path' );
const webpack = require( 'webpack' );

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
	entry: path.join( __dirname, 'desktop' ),
	output: {
		path: path.resolve( 'desktop/build' ),
		filename: 'desktop.js',
		chunkFilename: 'desktop.[name].js',
		libraryTarget: 'commonjs2',
	},
	target: 'electron-main',
	mode: isDevelopment ? 'development' : 'production',
	module: {
		rules: [
			{
				include: path.join( __dirname, 'sections.js' ),
				use: {
					loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
					options: { useRequire: true, onlyIsomorphic: true },
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			{
				test: /\.[jt]sx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: ( filepath ) => {
					// is it one of the npm dependencies we want to transpile?
					const lastIndex = filepath.lastIndexOf( '/node_modules/' );
					if ( lastIndex === -1 ) {
						return false;
					}
					return [ 'chalk', '@automattic/calypso-polyfills' ].some( ( pkg ) =>
						filepath.startsWith( `/node_modules/${ pkg }/`, lastIndex )
					);
				},
			},
			{
				test: /\.(sc|sa|c)ss$/,
				loader: 'ignore-loader',
			},
			{
				test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name]-[hash].[ext]',
						outputPath: 'images',
						publicPath: '/calypso/images/',
						emitFile: false,
					},
				},
			},
		],
	},
	node: {
		__filename: true,
		__dirname: true,
	},
	externals: [
		'webpack',
		'electron',

		// These are Calypso server modules we don't need, so let's not bundle them
		'webpack.config',
		'server/devdocs/search-index',
		'calypso/server/devdocs/search-index',
	],
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		modules: [ __dirname, 'node_modules' ],
		alias: {
			config: 'server/config',
			'calypso/config': 'server/config',
			// Alias calypso to ./client. This allows for smaller bundles, as it ensures that
			// importing `./client/file.js` is the same thing than importing `calypso/file.js`
			calypso: __dirname,
		},
	},
	plugins: [
		// The `formidable` package (used by `superagent`) contains conditional code that hijacks
		// the `require` function. That breaks webpack.
		new webpack.DefinePlugin( { 'global.GENTLY': false } ),
		new webpack.NormalModuleReplacementPlugin(
			/^my-sites[/\\]themes[/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^calypso[/\\]my-sites[/\\]themes[/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
	],
};
