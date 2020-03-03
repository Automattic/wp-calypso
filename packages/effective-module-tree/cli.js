#!/usr/bin/env node
const yargs = require( 'yargs' );
const { effectiveTree } = require( './index.js' );

const args = yargs
	.usage( 'Usage: $0' )
	.options( {
		exclude: {
			alias: 'e',
			array: true,
			describe: 'globs to exclude from the search',
		},
		include: {
			alias: 'i',
			array: true,
			describe: 'globs to include in the search (defaults to `**/package.json`)',
		},
	} )
	.example( '$0 --include "src/**/package.json"', 'use package.json files inside ./src' )
	.example(
		'$0 --exclude "test" --exclude "examples"',
		'use all package.json, except those inside ./test or ./examples'
	)
	.help( 'h' )
	.alias( 'h', 'help' )
	.epilogue(
		"It is highly recommended to use quotes to pass globs to --include and --exclude, so they don't get expanded by the shell"
	).argv;

effectiveTree( args.include || [ '**/package.json' ], args.exclude )
	.then( tree => {
		// eslint-disable-next-line no-console
		console.log( tree );
	} )
	.catch( err => {
		throw err;
	} );
