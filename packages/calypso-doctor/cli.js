#!/usr/bin/env node
const chalk = require( 'chalk' );
const yargs = require( 'yargs' );
const { runEvaluations } = require( './index.js' );

const main = async () => {
	console.log( chalk.yellow( '-=- Calypso Doctor -=-' ) );
	console.log( 'Checking the health of your system...' );
	console.log(
		chalk.gray(
			"If you don't want to run this tool automatically, set the env var CALYPSO_DOCTOR_SKIP=true"
		)
	);
	const results = await runEvaluations();

	console.log( '' );
	console.log( chalk.yellow( 'Tests' ) );
	results.forEach( ( { title, group, result, ignored, evaluationMessage } ) => {
		if ( ignored ) {
			console.log( `* ${ chalk.gray( '?' ) } ${ group } > ${ title }` );
		} else if ( result ) {
			console.log( `* ${ chalk.green( '✓' ) } ${ group } > ${ title }` );
		} else {
			console.log( `* ${ chalk.red( '✗' ) } ${ group } > ${ title }` );
		}
		if ( evaluationMessage ) {
			console.log( `    ${ evaluationMessage }` );
		}
	} );

	console.log( '' );
	console.log( chalk.yellow( 'Fixes' ) );
	if ( results.some( ( r ) => r.fixMessage ) ) {
		results.forEach( ( { fixMessage } ) => {
			if ( fixMessage ) {
				console.log( `> ${ fixMessage }` );
			}
		} );
	} else {
		console.log( `Nothing to fix, your system is ${ chalk.greenBright( 'ready' ) }!` );
	}

	console.log( '' );
};

main( yargs.usage( 'Usage: $0' ).help( 'h' ).alias( 'h', 'help' ).argv );
