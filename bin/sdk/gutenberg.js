/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const { isEmpty, omitBy } = require( 'lodash' );

const __rootDir = path.resolve( __dirname, '../../' );
const getBaseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const omitPlugins = [
	webpack.HotModuleReplacementPlugin,
];

const wordpressPackages = [
	'api-fetch',
	'block-serialization-spec-parser',
	'blocks',
	'components',
	'data',
	'editor',
	'element',
	'i18n',
];

const getWordPressExternals = () =>
	wordpressPackages.reduce( ( externals, package ) => {
		externals[ `@wordpress/${ package }` ] = {
			window: [
				'wp',
				// this is not as aggressive as `_.camelCase` in converting to
				// uppercase, where Lodash will convert letters following numbers
				package.replace(
					/-([a-z])/g,
					( match, letter ) => letter.toUpperCase()
				)
			]
		};
		return externals;
	}, {} );

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
					[ options.outputEditorFile || `${ name }-editor` ]: options.editorScript,
					[ options.outputViewFile || `${ name }-view` ]: options.viewScript,
				},
				isEmpty
			),
			externals: {
				...baseConfig.externals,
				...getWordPressExternals(),
				lodash: 'lodash',
				wp: 'wp',
			},
			optimization: {
				splitChunks: false,
			},
			output: {
				path: options.outputDir,
				filename: '[name].js',
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
