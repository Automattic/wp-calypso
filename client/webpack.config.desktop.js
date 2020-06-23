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
		libraryTarget: 'commonjs2',
	},
	target: 'electron-main',
	mode: isDevelopment ? 'development' : 'production',
	optimization: { minimize: false },
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
		'express',
		'webpack',
		'superagent',
		'electron',
		'component-tip',

		// These are Calypso server modules we don't need, so let's not bundle them
		'webpack.config',
		'server/devdocs/search-index',
	],
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		modules: [ __dirname, 'node_modules' ],
		alias: {
			config: 'server/config',
		},
	},
	plugins: [
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]abtest$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]olark$/, 'lodash/noop' ), // Depends on DOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]user$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^lib[/\\]post-normalizer[/\\]rule-create-better-excerpt$/,
			'lodash/noop'
		), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^components[/\\]seo[/\\]reader-preview$/,
			'components/empty-component'
		), // Conflicts with component-closest module
		new webpack.NormalModuleReplacementPlugin(
			/^components[/\\]popover$/,
			'components/null-component'
		), // Depends on BOM and interactions don't work without JS
		new webpack.NormalModuleReplacementPlugin(
			/^my-sites[/\\]themes[/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^client[/\\]layout[/\\]guided-tours[/\\]config$/,
			'components/empty-component'
		), // should never be required server side
		new webpack.NormalModuleReplacementPlugin(
			/^components[/\\]site-selector$/,
			'components/null-component'
		), // Depends on BOM
	],
};
