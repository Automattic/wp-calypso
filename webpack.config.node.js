/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	path = require( 'path' ),
	fs = require( 'fs' );

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
			return ['.bin'].indexOf( module ) === -1;
		} )
		.forEach( function( module ) {
			externals[module] = 'commonjs ' + module;
		} );

	// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
	externals['webpack.config'] = 'commonjs webpack.config';
	// Exclude hot-reloader, as webpack will try and resolve this in production builds,
	// and error.
	// TODO: use WebpackDefinePlugin for CALYPSO_ENV, so we can make conditional requires work
	externals['bundler/hot-reloader'] = 'commonjs bundler/hot-reloader';
	// Exclude the devdocs search-index, as it's huge.
	externals['devdocs/search-index'] = 'commonjs devdocs/search-index';
	// Exclude server/bundler/assets, since the files it requires don't exist until the bundler has run
	externals['bundler/assets'] = 'commonjs bundler/assets';

	return externals;
}

module.exports = {
	devtool: 'source-map',
	entry: 'index.js',
	target: 'node',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'bundle-' + ( process.env.CALYPSO_ENV || 'development' ) + '.js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|devdocs\/search-index)/,
				loader: 'babel-loader?optional[]=runtime'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	resolve: {
		extensions: [ '', '.json', '.js', '.jsx' ],
		modulesDirectories: [ 'node_modules', path.join( __dirname, 'server' ), path.join( __dirname, 'shared' ), __dirname ]
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
		new webpack.IgnorePlugin( /^public/ ),
		new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
		new webpack.IgnorePlugin( /^assets/ ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/warn$/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/paths/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/user/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^analytics$/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^post-editor/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^components\/sites-popover/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^components\/spinner/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^components\/gravatar/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^components\/site-stats-sticky-link/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^notifications$/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/layout-focus$/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^components\/popover/, 'components/empty' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/cart-values/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/upgrades/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /^lib\/wp/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /detect-history-navigation/, 'lodash/utility/noop' ),
		new webpack.NormalModuleReplacementPlugin( /section-nav/, 'components/empty' ),
	],
	externals: getExternals()
};

