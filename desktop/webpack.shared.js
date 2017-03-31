/**
 * External Dependencies
 */
var path = require( 'path' );
var webpack = require( 'webpack' );

module.exports = {
	target: 'node',
	module: {
		loaders: [
			{
				test: /sections.js$/,
				exclude: 'node_modules',
				loader: path.join( __dirname, '..', 'server', 'isomorphic-routing', 'loader' )
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	node: {
		__filename: true,
		__dirname: true
	},
	context: __dirname,
	externals: [
		'express',
		'webpack',
		'superagent',
		'electron',
		'component-tip',

		// These are Calypso server modules we don't need, so let's not bundle them
		'webpack.config',
		'bundler/hot-reloader',
		'devdocs/search-index',
		'devdocs/components-usage-stats.json'
	],
	resolve: {
		extensions: [ '', '.js', '.json', '.jsx' ],
		modulesDirectories: [
			'node_modules',
		],
		root: [
			path.join( __dirname, '..', 'server' ),
			path.join( __dirname, '..', 'client' ),
			path.join( __dirname, 'desktop' ),
		],
	},
	plugins: [
		// new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.NormalModuleReplacementPlugin( /^lib\/olark$/, 'lodash/noop' ), // Too many dependencies, e.g. sites-list
		new webpack.NormalModuleReplacementPlugin( /^components\/seo\/preview-upgrade-nudge$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^components\/popover$/, 'components/empty-component' ), // Depends on BOM and interactions don't work without JS
		new webpack.NormalModuleReplacementPlugin( /^lib\/analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib\/upgrades\/actions$/, 'lodash/noop' ), // Uses Flux dispatcher
		new webpack.NormalModuleReplacementPlugin( /^lib\/route$/, 'lodash/noop' ), // Depends too much on page.js
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/thanks-modal$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/themes-site-selector-modal$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/theme-upload$/, 'components/empty-component' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/single-site$/, 'components/empty-component' ), // Depends on DOM
		new webpack.NormalModuleReplacementPlugin( /^my-sites\/themes\/multi-site$/, 'components/empty-component' ), // Depends on DOM
	],
};
