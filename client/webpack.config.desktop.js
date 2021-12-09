const path = require( 'path' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const webpack = require( 'webpack' );
const cacheIdentifier = require( '../build-tools/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );

const isDevelopment = process.env.NODE_ENV === 'development';
const cacheDirectory = path.resolve( '.cache', 'babel-desktop' );

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
					loader: path.join( __dirname, '../build-tools/webpack/sections-loader' ),
					options: {
						useRequire: true,
						onlyIsomorphic: true,
						forceAll: ! isDevelopment,
						activeSections: config( 'sections' ),
						enableByDefault: config( 'enable_all_sections' ),
					},
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( 'babel.config.js' ),
				cacheDirectory,
				cacheIdentifier,
				cacheCompression: false,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount,
				presets: [ require.resolve( '@automattic/calypso-babel-config/preset/dependencies' ) ],
				cacheDirectory,
				cacheIdentifier,
				cacheCompression: false,
				include: shouldTranspileDependency,
			} ),
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
		'keytar',

		// These are Calypso server modules we don't need, so let's not bundle them
		'webpack.config',
	],
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'calypso:src', 'module', 'main' ],
		modules: [ __dirname, 'node_modules' ],
		alias: {
			config: 'calypso/server/config',
			'@automattic/calypso-config': 'calypso/server/config',
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
			/^calypso[/\\]my-sites[/\\]themes[/\\]theme-upload$/,
			'calypso/components/empty-component'
		), // Depends on BOM
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ), // server doesn't use moment locales
	],
};
