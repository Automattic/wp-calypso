#!/usr/bin/env node

/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;
const yargs = require( 'yargs' );

const buildGutenberg = argv => {
	const compiler = path.resolve( __dirname, 'sdk/gutenberg.js' );
	const editorScript = path.resolve( __dirname, '../', argv.editorScript );

	spawnSync( 'node', [ compiler, editorScript, ( argv.outputDir || '' ) ], {
		shell: true,
		stdio: 'inherit',
	} );
};

yargs
	.scriptName( 'calypso-sdk' )
	.usage( 'Usage: $0 <command> [options]' )
	.command( {
		command: 'gutenberg',
		desc: 'Build a Gutenberg extension',
		builder: yargs => yargs.options( {
			'editor-script': {
				description: 'Entry for editor side JavaScript file',
				type: 'string',
				required: true,
			},
			'output-dir': {
				alias: 'o',
				description: 'Output directory for the built assets.',
				type: 'string',
				coerce: path.resolve,
			}
		} ),
		handler: buildGutenberg
	} )
	.requiresArg( [ 'editor-script', 'output-dir' ] )
	.demandCommand( 1, chalk.red( 'You must provide a valid command!' ) )
	.alias( 'help', 'h' )
	.version( false )
	.argv;
