#!/usr/bin/env node

/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;
const yargs = require( 'yargs' );

const buildBlock = argv => {
	const compiler = path.resolve( __dirname, 'create-scripts/block.js' );
	const editorScript = path.resolve( __dirname, '../', argv.editorScript );

	spawnSync( 'node', [ compiler, editorScript, ( argv.outputDir || '' ) ], {
		shell: true,
		stdio: 'inherit',
	} );
};

yargs
	.scriptName( 'calypso-gutenberg-sdk' )
	.usage( 'Usage: $0 <command> [options]' )
	.command( {
		command: 'build-block',
		desc: 'Build a block',
		builder: yargs => yargs.options( {
			'editor-script': {
				description: 'Entry for editor side JavaScript file',
				type: 'string',
				required: true,
			},
			'output-dir': {
				alias: 'o',
				description: 'Output directory for the built block assets.',
				type: 'string',
				coerce: path.resolve,
			}
		} ),
		handler: buildBlock
	} )
	.requiresArg( [ 'editor-script', 'output-dir' ] )
	.demandCommand( 1, chalk.red( 'You must provide a valid command!' ) )
	.alias( 'help', 'h' )
	.version( false )
	.argv;
