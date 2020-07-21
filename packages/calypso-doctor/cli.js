#!/usr/bin/env node
const yargs = require( 'yargs' );
const chalk = require( 'chalk' );
const { runEvaluations } = require( './index.js' );

const main = async ( args ) => {
	const results = await runEvaluations( { fix: args.fix } );

	console.log( '' );
	console.log( chalk.yellow( 'Tests' ) );
	results.forEach( ( { title, group, result, message } ) => {
		const mark = result ? chalk.green( '✓' ) : chalk.red( '✗' );
		console.log( `* ${ mark } ${ group } > ${ title }` );

		if ( message ) console.log( `    ${ message }` );
	} );

	console.log( '' );
	console.log( chalk.yellow( 'Fixes' ) );
	if ( results.some( ( r ) => r.fixMessage ) ) {
		results.forEach( ( { fixMessage } ) => {
			if ( fixMessage ) console.log( `> ${ fixMessage }` );
		} );
	} else {
		console.log( `Nothing to fix, your system is ${ chalk.greenBright( 'ready' ) }!` );
	}

	console.log( '' );
};

main( yargs.usage( 'Usage: $0' ).help( 'h' ).alias( 'h', 'help' ).argv );
