#!/usr/bin/env node

/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const yargs = require( 'yargs' );

/**
 * Internal dependencies
 */
const gutenberg = require( './sdk/gutenberg.js' );

// Script name is used in help instructions;
// pick between `npm run calypso-sdk` and `npx calypso-sdk`.
// Show also how npm scripts require delimiter to pass arguments.
const calleeScript = path.basename( process.argv[ 1 ] );
const scriptName = calleeScript === path.basename( __filename ) ? 'npm run calypso-sdk' : calleeScript;
const delimit = scriptName.substring( 0, 3 ) === 'npm' ? '-- ' : '';

yargs
	.scriptName( scriptName )
	.usage( `Usage: $0 <command> ${ delimit }[options]` )
	.example( `$0 gutenberg ${ delimit }--editor-script=hello-dolly.js` )
	.command( {
		command: 'gutenberg',
		desc: 'Build a Gutenberg extension',
		builder: yargs => yargs.options( {
			'mode': {
				alias: 'm',
				description: 'Choose the way how assets are optimized.',
				type: 'string',
				choices: [ 'production', 'development' ],
				default: 'production',
				requiresArg: true,
			},
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
				required: false,
				coerce: value => path.resolve( __dirname, '../', value ),
				requiresArg: true,
			},
			'output-dir': {
				alias: 'o',
				description: 'Output directory for the built assets. Intermediate directories are created as required.',
				type: 'string',
				coerce: path.resolve,
				requiresArg: true,
			},
		} ),
		handler: argv => gutenberg.compile( argv )
	} )
	.demandCommand( 1, chalk.red( 'You must provide a valid command!' ) )
	.alias( 'help', 'h' )
	.version( false )
	.argv;
