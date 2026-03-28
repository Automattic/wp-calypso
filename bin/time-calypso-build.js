#!/usr/bin/env node

/**
 * Runs the same phases as `yarn build` (see package.json) and prints wall-clock
 * time per phase so you can see what dominates `yarn start` before the server runs.
 *
 * Usage: yarn time-build
 */

const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );

const repoRoot = path.join( __dirname, '..' );
const runp = path.join( repoRoot, 'node_modules', '.bin', 'run-p' );

function runPhase( label, command, args ) {
	const t0 = Date.now();
	console.error( chalk.hex( '#21759b' )( `\n▸ ${ label }` ) );
	const result = spawnSync( command, args, {
		cwd: repoRoot,
		stdio: 'inherit',
		env: process.env,
		shell: false,
	} );
	const ms = Date.now() - t0;
	if ( result.status !== 0 ) {
		console.error( chalk.red( `\n[calypso-time] FAILED: ${ label } (exit ${ result.status })\n` ) );
		process.exit( result.status ?? 1 );
	}
	return { label, ms };
}

if ( ! fs.existsSync( runp ) ) {
	console.error( chalk.red( 'run-p not found. Run `yarn install` from the repo root.\n' ) );
	process.exit( 1 );
}

console.error(
	chalk.bold( 'Calypso `yarn build` phase timings' ) +
		chalk.gray( ' — each line is wall time for that step.\n' )
);

const rows = [];
rows.push(
	runPhase( 'build-packages-if-needed.sh', 'bash', [
		path.join( repoRoot, 'bin/build-packages-if-needed.sh' ),
	] )
);
rows.push( runPhase( 'yarn build-static', 'yarn', [ 'run', 'build-static' ] ) );
rows.push( runPhase( 'yarn build-css', 'yarn', [ 'run', 'build-css' ] ) );
rows.push( runPhase( 'run-p build-devdocs:*', runp, [ '-s', 'build-devdocs:*' ] ) );
rows.push(
	runPhase( 'run-p build-server build-client-if-prod', runp, [
		'-s',
		'build-server',
		'build-client-if-prod',
	] )
);

const labelWidth = Math.max( ...rows.map( ( r ) => r.label.length ), 12 );

console.error( chalk.bold( '\n── Summary ──\n' ) );
let total = 0;
for ( const { label, ms } of rows ) {
	total += ms;
	const s = ( ms / 1000 ).toFixed( 1 ).padStart( 6 ) + 's';
	console.error( `  ${ label.padEnd( labelWidth ) }  ${ chalk.yellow( s ) }` );
}
console.error(
	`\n  ${ 'Total'.padEnd( labelWidth ) }  ${ chalk.green.bold(
		( total / 1000 ).toFixed( 1 ) + 's'
	) }\n`
);

console.error(
	chalk.gray(
		'In development, `build-client-if-prod` usually finishes instantly; ' +
			'`build-server` (webpack → build/server.js) is typically the slow step.\n' +
			'After the server exists, trace boot + first compile:  CALYPSO_TIME_START=true yarn start-build\n'
	)
);
