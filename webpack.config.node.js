/**
 * **** WARNING: No ES6 modules here. Not transpiled! ****
 */

/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const path = require( 'path' );
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require( 'webpack' );
const _ = require( 'lodash' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( 'config' );
const bundleEnv = config( 'env' );
const { workerCount } = require( './webpack.common' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const nodeExternals = require( 'webpack-node-externals' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );

/**
 * Internal variables
 */
const isDevelopment = bundleEnv === 'development';

const fileLoader = FileConfig.loader( {
	publicPath: isDevelopment ? '/calypso/evergreen/images/' : '/calypso/images/',
	emitFile: false, // On the server side, don't actually copy files
} );

const commitSha = process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)';

/**
 * This lists modules that must use commonJS `require()`s
 * All modules listed here need to be ES5.
 *
 * @returns {Array} list of externals
 */
function getExternals() {
	return [
		// Don't bundle any node_modules, both to avoid a massive bundle, and problems
		// with modules that are incompatible with webpack bundling.
		//
		nodeExternals( {
			whitelist: [
				// `@automattic/components` is forced to be webpack-ed because it has SCSS and other
				// non-JS asset imports that couldn't be processed by Node.js at runtime.
				'@automattic/components',

				// Ensure that file-loader files imported from packages in node_modules are
				// _not_ externalized and can be processed by the fileLoader.
				fileLoader.test,
			],
		} ),
		// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
		'webpack.config',
		// Exclude hot-reloader, as webpack will try and resolve this in production builds,
		// and error.
		'bundler/hot-reloader',
		// Exclude the devdocs search-index, as it's huge.
		'devdocs/search-index',
		// Exclude the devdocs components usage stats data
		'devdocs/components-usage-stats.json',
		'devdocs/components-usage-stats.json',
		// Exclude server/bundler/assets, since the files it requires don't exist until the bundler has run
		'bundler/assets',
	];
}

const webpackConfig = {
	devtool: 'source-map',
	entry: './index.js',
	target: 'node',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'bundle.js',
	},
	mode: isDevelopment ? 'development' : 'production',
	optimization: { minimize: false },
	module: {
		rules: [
			{
				include: path.join( __dirname, 'client/sections.js' ),
				use: {
					loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
					options: { forceRequire: true, onlyIsomorphic: true },
				},
			},
			TranspileConfig.loader( {
				workerCount,
				configFile: path.join( __dirname, 'babel.config.js' ),
				cacheDirectory: path.join( __dirname, 'build', '.babel-server-cache' ),
				cacheIdentifier,
				exclude: /(node_modules|devdocs[/\\]search-index)/,
			} ),
			fileLoader,
			{
				test: /\.(sc|sa|c)ss$/,
				loader: 'ignore-loader',
			},
		],
	},
	resolve: {
		modules: [
			__dirname,
			path.join( __dirname, 'server' ),
			path.join( __dirname, 'client' ),
			path.join( __dirname, 'client', 'extensions' ),
			'node_modules',
		],
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
	},
	node: {
		// Tell webpack we want to supply absolute paths for server code,
		// specifically needed by the client code bundler.
		__filename: true,
		__dirname: true,
	},
	plugins: _.compact( [
		// Require source-map-support at the top, so we get source maps for the bundle
		new webpack.BannerPlugin( {
			banner: 'require( "source-map-support" ).install();',
			raw: true,
			entryOnly: false,
		} ),
		new webpack.ExternalsPlugin( 'commonjs', getExternals() ),
		new webpack.DefinePlugin( {
			BUILD_TIMESTAMP: JSON.stringify( new Date().toISOString() ),
			COMMIT_SHA: JSON.stringify( commitSha ),
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
		} ),
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]abtest$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]user$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^my-sites[/\\]themes[/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
	] ),
};

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push(
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]desktop$/, 'lodash/noop' )
	);
}

module.exports = webpackConfig;
