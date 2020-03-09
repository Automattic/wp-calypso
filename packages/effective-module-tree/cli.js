#!/usr/bin/env node
const yargs = require( 'yargs' );
const { effectiveTree } = require( './index.js' );

const args = yargs
	.usage( 'Usage: $0' )
	.options( {
		exclude: {
			alias: 'e',
			array: true,
			describe: 'glob with package.json files to exclude from the search',
		},
		root: {
			alias: 'r',
			describe: 'Path of the root package.json. Defaults to current directory',
		},
	} )
	.example( '$0', 'generate the tree for the project in the current directory' )
	.example(
		'$0 --exclude "test" --exclude "examples"',
		'same, but ignore package.json files inside, ./test or ./examples'
	)
	.example( '$0 --root "./src"', 'generate the tree for the project inside ./src' )
	.help( 'h' )
	.alias( 'h', 'help' )
	.epilogue(
		"It is highly recommended to use quotes to pass globs to --exclude, so they don't get expanded by the shell"
	).argv;

effectiveTree( { root: args.root || process.cwd(), exclude: args.exclude || [] } )
	.then( tree => {
		// eslint-disable-next-line no-console
		console.log( tree );
	} )
	.catch( err => {
		throw err;
	} );
