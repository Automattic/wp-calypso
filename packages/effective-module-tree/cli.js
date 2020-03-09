#!/usr/bin/env node
const yargs = require( 'yargs' );
const path = require( 'path' );
const { effectiveTree } = require( './index.js' );

const args = yargs
	.usage( 'Usage: $0' )
	.options( {
		root: {
			alias: 'r',
			describe: 'Path of the root package.json. Defaults to ./package.json',
			default: path.join( process.cwd(), 'package.json' ),
		},
	} )
	.example( '$0', 'generate the tree for the project in the current directory' )
	.example( '$0 --root "./src"', 'generate the tree for the project inside ./src' )
	.help( 'h' )
	.alias( 'h', 'help' ).argv;

effectiveTree( args.root )
	.then( tree => {
		// eslint-disable-next-line no-console
		console.log( tree );
	} )
	.catch( err => {
		throw err;
	} );
