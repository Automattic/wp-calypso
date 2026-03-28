#!/usr/bin/env node

/**
 * Minimal bunyan JSON → human-readable formatter for local dev.
 *
 * Replaces `| bunyan -o short` in `yarn start-build`.
 * - Shows only method, path, status, and duration.
 * - Suppresses webpack-dev-middleware noise lines.
 * - Clears the active spinner line before printing so logs don't
 *   collide with the compile-progress spinner on stderr.
 * - Non-JSON lines pass through unless they're known webpack noise.
 * - CALYPSO_VERBOSE_LOG=true shows all fields per request.
 */

const readline = require( 'readline' );
const chalk = require( 'chalk' );

const verbose = process.env.CALYPSO_VERBOSE_LOG === 'true';

// Webpack noise patterns to suppress — our spinner and "Ready!" message cover these.
const NOISE_PATTERNS = [
	/^(<i> )?\[webpack-dev-middleware\]/,
	/^webpack built /,
	/^webpack compiled /,
	/^\d+ WARNINGS? in child compilations/,
];

const rl = readline.createInterface( { input: process.stdin } );

rl.on( 'line', ( line ) => {
	let record;
	try {
		record = JSON.parse( line );
	} catch {
		// Not JSON — pass through unless it's webpack noise.
		// Strip ANSI codes before matching so colored prefixes like `<i>` don't break patterns.
		// eslint-disable-next-line no-control-regex
		const stripped = line.replace( /\x1b\[[0-9;]*m/g, '' ).trim();
		if ( stripped && NOISE_PATTERNS.some( ( p ) => p.test( stripped ) ) ) {
			return;
		}
		clearSpinnerLine();
		process.stdout.write( line + '\n' );
		return;
	}

	// Only format HTTP request-finished records; skip everything else.
	if ( ! record.method || ! record.path ) {
		return;
	}

	const status = record.status || '';
	const duration = record.duration != null ? `${ record.duration }ms` : '';
	let statusColor = 'green';
	if ( status >= 500 ) {
		statusColor = 'red';
	} else if ( status >= 400 ) {
		statusColor = 'yellow';
	}
	const formatted =
		chalk.hex( '#21759b' )( '  ▸ ' ) +
		chalk.bold( record.method ) +
		' ' +
		record.path +
		' ' +
		chalk[ statusColor ]( status ) +
		( duration ? ' ' + chalk.gray( duration ) : '' );

	clearSpinnerLine();
	process.stdout.write( formatted + '\n' );

	if ( verbose ) {
		const skip = new Set( [
			'v',
			'name',
			'hostname',
			'pid',
			'level',
			'method',
			'path',
			'status',
			'duration',
			'msg',
			'time',
		] );
		for ( const [ key, value ] of Object.entries( record ) ) {
			if ( ! skip.has( key ) ) {
				process.stdout.write( chalk.gray( `       ${ key }: ${ value }` ) + '\n' );
			}
		}
	}
} );

function clearSpinnerLine() {
	if ( process.stderr.isTTY ) {
		process.stderr.write( '\r\x1b[2K' );
	}
}
