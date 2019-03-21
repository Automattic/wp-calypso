/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const wordpressExternals = require( '@automattic/calypso-build/webpack/wordpress-externals' );

/**
 * Internal dependencies
 */
// const { workerCount } = require( './webpack.common' ); // todo: shard...

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

const editorSetup = path.join( __dirname, 'src', 'preset', 'setup', 'editor' );
const viewSetup = path.join( __dirname, 'src', 'preset', 'setup', 'view' );

function blockScripts( type, inputDir, presetBlocks ) {
	return presetBlocks
		.map( block => path.join( inputDir, 'blocks', block, `${ type }.js` ) )
		.filter( fs.existsSync );
}
/**
 * Return a webpack config object
 *
 * @return {object} webpack config
 */
function getWebpackConfig() {
	const workerCount = 1;
	const cssFilename = '[name].css';

	const presetPath = path.join( __dirname, 'src', 'preset', 'index.json' );
	const presetIndex = require( presetPath );
	const presetBlocks = _.get( presetIndex, [ 'production' ], [] );
	const presetBetaBlocks = _.get( presetIndex, [ 'beta' ], [] );
	const allPresetBlocks = [ ...presetBlocks, ...presetBetaBlocks ];

	// Helps split up each block into its own folder view script
	const viewBlocksScripts = allPresetBlocks.reduce( ( viewBlocks, block ) => {
		const viewScriptPath = path.join( __dirname, 'src', 'blocks', block, 'view.js' );
		if ( fs.existsSync( viewScriptPath ) ) {
			viewBlocks[ block + '/view' ] = [ viewSetup, ...[ viewScriptPath ] ];
		}
		return viewBlocks;
	}, {} );

	// Combines all the different blocks into one editor.js script
	const editorScript = [
		editorSetup,
		...blockScripts( 'editor', path.join( __dirname, 'src' ), presetBlocks ),
	];

	// Combines all the different blocks into one editor-beta.js script
	const editorBetaScript = [
		editorSetup,
		...blockScripts( 'editor', path.join( __dirname, 'src' ), allPresetBlocks ),
	];

	const webpackConfig = {
		bail: ! isDevelopment,
		context: __dirname,
		entry: {
			editor: editorScript,
			'editor-beta': editorBetaScript,
			...viewBlocksScripts,
		},
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
		output: {
			path: path.join( __dirname, 'dist' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
		optimization: {
			minimize: ! isDevelopment,
			minimizer: Minify( {
				cache: process.env.CIRCLECI
					? `${ process.env.HOME }/terser-cache`
					: 'docker' !== process.env.CONTAINER,
				parallel: workerCount,
				sourceMap: Boolean( process.env.SOURCEMAP ),
				terserOptions: {
					ecma: 5,
					safari10: true,
					mangle: true,
				},
			} ),
		},
		module: {
			rules: [
				TranspileConfig.loader( {
					workerCount,
					configFile: path.join( __dirname, '.babelrc.js' ),
					cacheDirectory: path.join( __dirname, '.cache' ),
					exclude: /node_modules\//,
				} ),
				SassConfig.loader( {
					preserveCssCustomProperties: false,
					includePaths: [ path.join( __dirname, 'client' ) ],
					prelude: '@import "~@automattic/calypso-color-schemes/src/shared/colors";',
				} ),
				FileConfig.loader(),
			],
		},
		resolve: {
			extensions: [ '.json', '.js', '.jsx' ],
			modules: [ 'node_modules' ],
		},
		node: false,
		plugins: [
			new webpack.DefinePlugin( {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
				global: 'window',
			} ),
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
			...SassConfig.plugins( { cssFilename, minify: ! isDevelopment } ),
			new DuplicatePackageCheckerPlugin(),
			new CopyWebpackPlugin( [
				{
					from: presetPath,
					to: 'index.json',
				},
			] ),
		],
		externals: [ wordpressExternals, 'wp', 'lodash' ],
	};

	return webpackConfig;
}

module.exports = getWebpackConfig;
