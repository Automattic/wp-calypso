#!/usr/bin/env node

const { spawn } = require( 'child_process' );

const [ , , stepName, separator, ...commandArgs ] = process.argv;

if ( ! stepName || separator !== '--' || commandArgs.length === 0 ) {
	console.error( 'Usage: node bin/run-with-timing.js <step-name> -- <command> [args...]' );
	process.exit( 1 );
}

const shouldProfile = process.env.PROFILE === 'true';
const startTime = process.hrtime.bigint();
const [ command, ...args ] = commandArgs;
const executable =
	process.platform === 'win32' && [ 'yarn', 'npx' ].includes( command )
		? `${ command }.cmd`
		: command;

const child = spawn( executable, args, {
	env: process.env,
	stdio: 'inherit',
} );

for ( const signal of [ 'SIGINT', 'SIGTERM' ] ) {
	process.on( signal, () => {
		if ( child.exitCode === null && ! child.killed ) {
			child.kill( signal );
		}
	} );
}

child.on( 'error', ( error ) => {
	console.error( `[timing] Failed to start ${ stepName }: ${ error.message }` );
	process.exit( 1 );
} );

child.on( 'close', ( code, signal ) => {
	if ( shouldProfile ) {
		const duration = Number( process.hrtime.bigint() - startTime ) / 1e9;
		let status = 'failed';

		if ( signal ) {
			status = `terminated by ${ signal }`;
		} else if ( code === 0 ) {
			status = 'completed';
		}

		console.log( `[timing] ${ stepName } ${ status } in ${ formatDuration( duration ) }` );
	}

	if ( signal ) {
		process.kill( process.pid, signal );
		return;
	}

	process.exit( code ?? 1 );
} );

function formatDuration( durationInSeconds ) {
	if ( durationInSeconds >= 3600 ) {
		const hours = Math.floor( durationInSeconds / 3600 );
		const minutes = Math.floor( ( durationInSeconds % 3600 ) / 60 );
		const seconds = durationInSeconds % 60;

		return `${ hours }h ${ minutes }m ${ seconds.toFixed( 1 ) }s`;
	}

	if ( durationInSeconds >= 60 ) {
		const minutes = Math.floor( durationInSeconds / 60 );
		const seconds = durationInSeconds % 60;

		return `${ minutes }m ${ seconds.toFixed( 1 ) }s`;
	}

	if ( durationInSeconds >= 1 ) {
		return `${ durationInSeconds.toFixed( 1 ) }s`;
	}

	return `${ Math.round( durationInSeconds * 1000 ) }ms`;
}
