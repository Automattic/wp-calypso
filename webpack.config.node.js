/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	path = require( 'path' ),
	HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' ),
	fs = require( 'fs' );

/**
 * Internal dependencies
 */
var config = require( 'config' );

/**
 * This lists modules that must use commonJS `require()`s
 * All modules listed here need to be ES5.
 *
 * @returns { object } list of externals
*/
function getExternals() {
	var externals = {};

	// Don't bundle any node_modules, both to avoid a massive bundle, and problems
	// with modules that are incompatible with webpack bundling.
	fs.readdirSync( 'node_modules' )
		.filter( function( module ) {
			return [ '.bin' ].indexOf( module ) === -1;
		} )
		.forEach( function( module ) {
			externals[ module ] = 'commonjs ' + module;
		} );

	// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
	externals[ 'webpack.config' ] = 'commonjs webpack.config';
	// Exclude hot-reloader, as webpack will try and resolve this in production builds,
	// and error.
	externals[ 'bundler/hot-reloader' ] = 'commonjs bundler/hot-reloader';
	// Exclude the devdocs search-index, as it's huge.
	externals[ 'devdocs/search-index' ] = 'commonjs devdocs/search-index';
	// Exclude the devdocs components usage stats data
	externals[ 'devdocs/components-usage-stats.json' ] = 'commonjs devdocs/components-usage-stats.json';
	// Exclude server/bundler/assets, since the files it requires don't exist until the bundler has run
	externals[ 'bundler/assets' ] = 'commonjs bundler/assets';
	// Map React and redux to the minimized version in production
	if ( config( 'env' ) === 'production' ) {
		externals[ 'react-with-addons' ] = 'commonjs react/dist/react-with-addons.min';
		externals.react = 'commonjs react/dist/react.min';
		externals.redux = 'commonjs redux/dist/redux.min';
	}

	return externals;
}

var webpackConfig = {
	devtool: 'source-map',
	entry: 'index.js',
	target: 'node',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'bundle.js',
	},
	module: {
		loaders: [
			{
				test: /sections.js$/,
				exclude: 'node_modules',
				loader: path.join( __dirname, 'server', 'isomorphic-routing', 'loader' )
			},
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|devdocs\/search-index)/,
				loader: 'babel',
				query: {
					plugins: [ [
						path.join( __dirname, 'server', 'bundler', 'babel', 'babel-plugin-transform-wpcalypso-async' ),
						{ async: false }
					] ]
				}
			},
			{
				test: /\.json$/,
				exclude: /(devdocs\/components-usage-stats.json)/,
				loader: 'json-loader'
			}
		]
	},
	resolve: {
		extensions: [ '', '.json', '.js', '.jsx' ],
		root: [ path.join( __dirname, 'server' ), path.join( __dirname, 'client' ), __dirname ],
		modulesDirectories: [ 'node_modules' ]
	},
	node: {
		// Tell webpack we want to supply absolute paths for server code,
		// specifically needed by the client code bundler.
		__filename: true,
		__dirname: true
	},
	plugins: [
		// Require source-map-support at the top, so we get source maps for the bundle
		new webpack.BannerPlugin( 'require( "source-map-support" ).install();', { raw: true, entryOnly: false } ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib\/olark$/, 'lodash/noop' ), // Too many dependencies, e.g. sites-list
		new webpack.NormalModuleReplacementPlugin( /^lib\/post-normalizer\/rule-create-better-excerpt$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^components\/seo\/preview-upgrade-nudge$/, 'components/empty-component' ), // Depends on page.js and should never be required server side
		new webpack.NormalModuleReplacementPlugin( /^components\/popover$/, 'components/empty-component' ), // Depends on BOM and interactions don't work without JS
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/themes-site-selector-modal$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/theme-upload$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/single-site$/, 'components/empty-component' ), // Depends on DOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/multi-site$/, 'components/empty-component' ), // Depends on DOM
		new webpack.NormalModuleReplacementPlugin( /^state\/ui\/editor\/selectors$/, 'lodash/noop' ), // will never be called server-side
		new webpack.NormalModuleReplacementPlugin( /^state\/posts\/selectors$/, 'lodash/noop' ), // will never be called server-side
		new webpack.NormalModuleReplacementPlugin( /^client\/layout\/guided-tours\/config$/, 'components/empty-component' ) // should never be required server side
	],
	externals: getExternals()
};

if ( config.isEnabled( 'webpack/persistent-caching' ) ) {
	webpackConfig.recordsPath = path.join( __dirname, '.webpack-cache', 'server-records.json' ),
	webpackConfig.plugins.unshift( new HardSourceWebpackPlugin( { cacheDirectory: path.join( __dirname, '.webpack-cache', 'server' ) } ) );
}

module.exports = webpackConfig;
