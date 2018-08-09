/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const { isEmpty, omitBy } = require( 'lodash' );

const __rootDir = path.resolve( __dirname, '../../' );
const CopyWebpackPlugin = require( path.resolve(
	__rootDir,
	'server/bundler/copy-webpack-plugin'
) );
const getBaseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const omitPlugins = [
	CopyWebpackPlugin,
	webpack.HotModuleReplacementPlugin,
];

const outputHandler = ( error, stats ) => {
	if ( error ) {
		console.error( error );
		console.log( chalk.red( 'Failed to build Gutenberg extension' ) );
		process.exit( 1 );
	}

	console.log( stats.toString() );

	if ( stats.hasErrors() ) {
		console.log( chalk.red( 'Finished building Gutenberg extension but with errors.' ) );
	} else if ( stats.hasWarnings() ) {
		console.log( chalk.yellow( 'Successfully built Gutenberg extension but with warnings.' ) );
	} else {
		console.log( chalk.green( 'Successfully built Gutenberg extension' ) );
	}
};

exports.compile = args => {
	const options = {
		outputDir: path.join( path.dirname( args.editorScript ), 'build' ),
		...args,
	};

	const name = path.basename( path.dirname( options.editorScript ).replace( /\/$/, '' ) );
	const baseConfig = getBaseConfig( { extensionName: name } );

	const config = {
		...baseConfig,
		...{
			context: __rootDir,
			mode: options.mode,
			entry: omitBy(
				{
					[ options.outputEditorFile || `${ name }-editor.js` ]: options.editorScript,
					[ options.outputViewFile || `${ name }-view.js` ]: options.viewScript,
				},
				isEmpty
			),
			externals: {
				...baseConfig.externals,
				'@wordpress/api-fetch': { window: [ 'wp', 'apiFetch' ] },
				'@wordpress/block-serialization-spec-parser': { window: [ 'wp', 'blockSerializationSpecParser' ] },
				'@wordpress/blocks': { window: [ 'wp', 'blocks' ] },
				'@wordpress/components': { window: [ 'wp', 'components' ] },
				'@wordpress/data': { window: [ 'wp', 'data' ] },
				'@wordpress/editor': { window: [ 'wp', 'editor' ] },
				'@wordpress/element': { window: [ 'wp', 'element' ] },
				'@wordpress/i18n': { window: [ 'wp', 'i18n' ] },
				lodash: 'lodash',
				wp: 'wp',
			},
			optimization: {
				splitChunks: false,
			},
			output: {
				path: options.outputDir,
				filename: '[name]',
				libraryTarget: 'window',
			},
			plugins: [
				...baseConfig.plugins.filter( plugin => omitPlugins.indexOf( plugin.constructor ) < 0 ),
			],
		},
	};

	const compiler = webpack( config );

	if ( options.watch ) {
		compiler.watch( {}, outputHandler );
	} else {
		compiler.run( outputHandler );
	}
};
