#!/usr/bin/env node

/** @format */
/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const yargs = require( 'yargs' );
const webpack = require( 'webpack' );

/**
 * Internal dependencies
 */
const gutenberg = require( './sdk/gutenberg.js' );
const notifications = require( './sdk/notifications.js' );

// Script name is used in help instructions;
// pick between `npm run calypso-sdk` and `npx calypso-sdk`.
// Show also how npm scripts require delimiter to pass arguments.
const calleeScript = path.basename( process.argv[ 1 ] );
const scriptName =
	calleeScript === path.basename( __filename ) ? 'npm run sdk' : calleeScript;
const delimit = scriptName.substring( 0, 3 ) === 'npm' ? '-- ' : '';
const calypsoRoot = path.resolve( __dirname, '..' );

const getBaseConfig = ( options = {} ) => {
	const getConfig = require( path.join( calypsoRoot, 'webpack.config.js' ) );
	const config = getConfig( options );

	// these are currently Calypso-specific
	const omitPlugins = [
		webpack.HotModuleReplacementPlugin,
	];

	return {
		...config,
		optimization: {
			splitChunks: false,
		},
		plugins: config.plugins.filter( plugin => ! omitPlugins.includes( plugin.constructor ) ),
	};
};

const build = ( target, argv ) => {
	const config = target.config( { argv, getBaseConfig, calypsoRoot } );
	const compiler = webpack( config );

	// watch takes an additional argument, adjust accordingly
	const runner = f => ( argv.watch ? compiler.watch( {}, f ) : compiler.run( f ) );

	runner( ( error, stats ) => {
		if ( error ) {
			console.error( error );
			console.log( chalk.red( 'Failed to build' ) );
			process.exit( 1 );
		}

		console.log( stats.toString() );

		if ( stats.hasErrors() ) {
			console.log( chalk.red( 'Built with errors' ) );
		} else if ( stats.hasWarnings() ) {
			console.log( chalk.yellow( 'Built with warnings' ) );
		} else {
			console.log( chalk.green( 'Built successfully' ) );
		}
	} );
};

yargs
	.scriptName( scriptName )
	.usage( `Usage: $0 <command> ${ delimit }[options]` )
	.example( `$0 gutenberg ${ delimit }--editor-script=hello-dolly.js` )
	.command( {
		command: 'gutenberg',
		desc: 'Build a Gutenberg extension',
		builder: yargs =>
			yargs.options( {
				'editor-script': {
					description: 'Entry for editor-side JavaScript file',
					type: 'string',
					required: true,
					coerce: value => path.resolve( __dirname, '../', value ),
					requiresArg: true,
				},
				'view-script': {
					description: 'Entry for rendered-page-side JavaScript file',
					type: 'string',
					coerce: value => path.resolve( __dirname, '../', value ),
					requiresArg: true,
				},
				'output-dir': {
					alias: 'o',
					description:
						'Output directory for the built assets. Intermediate directories are created as required.',
					type: 'string',
					coerce: path.resolve,
					requiresArg: true,
				},
				'output-editor-file': {
					description: 'Name of the built editor script output file (without the file extension).',
					type: 'string',
					requiresArg: true,
				},
				'output-view-file': {
					description: 'Name of the built view script output file (without the file extension).',
					type: 'string',
					requiresArg: true,
				},
				watch: {
					alias: 'w',
					description: 'Whether to watch for changes and automatically rebuild.',
					type: 'boolean',
				},
			} ),
		handler: argv => build( gutenberg, argv ),
	} )
	.command( {
		command: 'notifications',
		desc: 'Build the standalone notifications client',
		builder: yargs =>
			yargs.options( {
				'output-dir': {
					alias: 'o',
					description:
						'Output directory for the built assets. Intermediate directories are created as required.',
					type: 'string',
					coerce: path.resolve,
					required: true,
					requiresArg: true,
				},
			} ),
		handler: argv => build( notifications, argv ),
	} )
	.demandCommand( 1, chalk.red( 'You must provide a valid command!' ) )
	.alias( 'help', 'h' )
	.version( false ).argv;
