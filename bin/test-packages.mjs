#!/usr/bin/env node
// Runs the packages' unit tests on Jest and on Vitest. Jest gets every argument; Vitest gets the
// paths and the options both runners have, read with Jest's own parser, so Jest-only flags still work.
import { spawn } from 'node:child_process';
import { buildArgv } from 'jest';

const args = process.argv.slice( 2 );
const argv = await buildArgv( args );
const watch = Boolean( argv.watch || argv.watchAll );

const vitestArgs = [ '--passWithNoTests', ...argv._.map( String ) ];
if ( argv.testNamePattern ) {
	vitestArgs.push( '--testNamePattern', argv.testNamePattern );
}
if ( argv.updateSnapshot ) {
	vitestArgs.push( '--update' );
}
if ( argv.runInBand ) {
	vitestArgs.push( '--no-file-parallelism', '--maxWorkers=1' );
}
if ( watch ) {
	// Keystrokes go to Jest's watch UI only; Vitest re-runs on file changes by itself.
	vitestArgs.push( '--watch', '--clearScreen=false' );
}

const run = ( script, scriptArgs, stdin = 'inherit' ) =>
	new Promise( ( resolve ) => {
		console.log( `> yarn ${ script } ${ scriptArgs.join( ' ' ) }` );
		spawn( 'yarn', [ 'run', script, ...scriptArgs ], {
			stdio: [ stdin, 'inherit', 'inherit' ],
		} ).on( 'close', resolve );
	} );

const jest = () => run( 'test-packages:jest', [ '--passWithNoTests', ...args ] );
const vitest = () => run( 'test-packages:vitest', vitestArgs, watch ? 'ignore' : 'inherit' );

const codes = watch ? await Promise.all( [ jest(), vitest() ] ) : [ await jest(), await vitest() ];
process.exitCode = codes.find( ( code ) => code !== 0 ) ?? 0;
