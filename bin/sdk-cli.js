#!/usr/bin/env node

/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;
const yargs = require( 'yargs' );

const buildBlockScript = path.resolve( __dirname, 'create-scripts/block.js' );
const extensionsDir = path.resolve( __dirname, '../client/gutenberg/extensions' );
const prePackagedBlocks = [
	'editor-notes',
	'hello-dolly',
];

const buildBlock = argv => {
	let entryFile;

	if ( argv.block ) {
		switch ( argv.block ) {
			case 'editor-notes':
				entryFile = path.join( extensionsDir, 'editor-notes/index.js' );
				break;
			case 'hello-dolly':
				entryFile = path.join( extensionsDir, 'hello-dolly/hello-block.js' );
				break;
			default:
				console.log( chalk.red( `Unknown block "${ argv.block }" - list available blocks with "list-blocks"` ) );
				process.exit( 1 );
		}
	} else if ( argv.editorJs ) {
		entryFile = argv.editorJs;
	} else {
		yargs.showHelp();
		console.log( chalk.red( 'Missing a block entryfile.' ) );
		process.exit( 1 );
	}
	spawnSync( 'node', [ buildBlockScript, entryFile, ( argv.output || '' ) ], {
		env: {
			SKIP_FLAG_IMAGES: true,
		},
		shell: true,
		stdio: 'inherit',
	} );
};

yargs
	.scriptName( 'calypso-gutenberg-sdk' )
	.usage( 'Usage: $0 <command> [options]' )
	.command( {
		command: 'list-blocks',
		desc: 'List pre-packaged blocks; build them with --block',
		handler: () => console.log( prePackagedBlocks.join( '\n' ) )
	} )
	.command( {
		command: 'build-block',
		desc: 'Build a block',
		builder: yargs => yargs.options( {
			'block': {
				alias: 'b',
				description: 'Build a pre-packaged block.',
				type: 'string',
				choises: prePackagedBlocks,
			},
			'editor-js': {
				description: 'Entry for editor side JavaScript file',
				type: 'string',
				coerce: path.resolve,
			},
			'output': {
				alias: 'o',
				description: 'Output directory for the built block assets.',
				type: 'string',
				coerce: path.resolve
			}
		} ),
		handler: buildBlock
	} )
	.conflicts( 'block', [ 'editor-js' ] )
	.requiresArg( [ 'block', 'editor-js', 'output' ] )
	.demandCommand( 1, chalk.red( 'You must provide a valid command!' ) )
	.alias( 'help', 'h' )
	.version( false )
	.argv;
