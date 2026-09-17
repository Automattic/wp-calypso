#!/usr/bin/env node
const { promises: fs } = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const yargs = require( 'yargs' );
const { runEvaluations } = require( './index.js' );

// Relative to cwd, so each git worktree gets its own stamp (node_modules is per-worktree).
const stampPath = path.join( 'node_modules', '.cache', 'calypso-doctor-ran' );

const alreadyRan = async () => {
	try {
		await fs.access( stampPath );
		return true;
	} catch {
		return false;
	}
};

const writeStamp = async () => {
	try {
		await fs.mkdir( path.dirname( stampPath ), { recursive: true } );
		await fs.writeFile( stampPath, new Date().toISOString() );
	} catch {
		// Best effort; worst case the doctor runs again next time.
	}
};

const main = async ( argv ) => {
	if ( argv.once && ( await alreadyRan() ) ) {
		return;
	}
	console.log( chalk.yellow( '-=- Calypso Doctor -=-' ) );
	console.log( 'Checking the health of your system...' );
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

	if ( argv.once ) {
		await writeStamp();
	}
};

main(
	yargs
		.usage( 'Usage: $0' )
		.option( 'once', {
			type: 'boolean',
			default: false,
			describe: 'Skip if the doctor already ran in this checkout (stamp in node_modules/.cache)',
		} )
		.help( 'h' )
		.alias( 'h', 'help' ).argv
).catch( ( error ) => {
	// Diagnostics must never block startup: report and exit clean.
	console.error( chalk.red( 'Calypso Doctor failed, continuing:' ), error.message ?? error );
	process.exitCode = 0;
} );
