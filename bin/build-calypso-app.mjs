/**
 * This script is used to build calypso apps (anything in /apps). Since most of
 * those apps use a similar structure and ultimately deploy to WordPress.com, we
 * include sandbox sync logic to assist with local DevX.
 */

import { exec } from 'child_process';
import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import runAll from 'npm-run-all';
import treeKill from 'tree-kill';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// When we run a build which has more than 10 build tasks in parallel (like ETK),
// Node shows a warning. We just need to increase the number of allowed listeners
// to handle larger numbers of parallel tasks.
EventEmitter.setMaxListeners( 20 );

// Default NODE_ENV is development unless manually set to production.
if ( process.env.NODE_ENV == null ) {
	process.env.NODE_ENV = 'development';
}
if ( process.env.BROWSERSLIST_ENV == null ) {
	process.env.BROWSERSLIST_ENV = 'wpcom';
}
if ( process.env.DISABLE_DUPLICATE_PACKAGE_CHECK == null ) {
	process.env.DISABLE_DUPLICATE_PACKAGE_CHECK = true;
}

const { argv } = yargs( hideBin( process.argv ) ).options( {
	sync: { type: 'boolean', default: false, implies: 'remotePath' },
	remotePath: { type: 'string' },
	localPath: {
		type: 'string',
		required: true,
		coerce: ( distPath ) => ( distPath ? `${ process.cwd() }/${ distPath }/` : undefined ),
	},
	verbose: { type: 'boolean', default: false, alias: 'v' },
	watch: { type: 'boolean', default: process.env.NODE_ENV === 'development', alias: 'w' },
} );
const VERBOSE = argv.verbose;

try {
	await runBuilder( argv );
} catch ( e ) {
	const { pid } = process;
	if ( VERBOSE ) {
		console.log( `Removing children of PID: ${ pid }` );
	}
	treeKill( pid );
	showTips( e.tasks );
	console.error( e.message );
}

async function runBuilder( args ) {
	const { sync, localPath, remotePath, watch } = args;

	if ( VERBOSE ) {
		console.log( JSON.stringify( args ) );
	}

	const runOpts = {
		stdout: process.stdout,
		stderr: process.stderr,
		printLabel: true,
		parallel: true,
	};
	console.log( 'Cleaning...' );
	await runAll( [ 'clean' ], runOpts );

	console.log( 'Starting webpack...' );
	return Promise.all( [
		runAll( [ `build:*${ watch ? ' --watch' : '' }` ], runOpts ).then( () => {
			console.log( 'Build completed!' );
			if ( ! watch && sync ) {
				// In non-watch + sync mode, we sync only once after the build has finished.
				setupRemoteSync( localPath, remotePath );
			}
		} ),
		// In watch + sync mode, we start watching to sync while the webpack build is happening.
		watch && sync && setupRemoteSync( localPath, remotePath, true ),
	] );
}

/**
 * Sets up remote syncing. In watch mode, schedules syncs to the remote after changes
 * have stopped happening and existing syncs have stopped. In non-watch mode, does
 * a single sync. Rejects if any errors happen during rsync. Resolves in non-watch
 * mode after a full sync. Is otherwise pending until the user kills the process.
 */
function setupRemoteSync( localPath, remotePath, shouldWatch = false ) {
	console.log( 'HERE' );
	return new Promise( ( resolve, reject ) => {
		let rsync = null;
		const debouncedSync = debouncer( () => {
			if ( VERBOSE ) {
				console.log( 'Attempting sync...' );
			}
			if ( rsync ) {
				// Kill any existing rsync attempt.
				rsync.kill( 'SIGINT' );
			}
			rsync = exec(
				`rsync -ahz --exclude=".*" ${ localPath } wpcom-sandbox:${ remotePath }`,
				( err ) => {
					rsync = null;
					// err.signal is null on macOS, so use error code 20 in that case.
					const wasRsyncCancelled = err && ( err.signal === 'SIGINT' || err.code === 20 );
					if ( err && ! wasRsyncCancelled ) {
						// If there's an error unrelated to cancellation, reject and abort.
						reject( err );
						return;
					} else if ( wasRsyncCancelled ) {
						if ( VERBOSE ) {
							console.log( 'Restarting sync.' );
						}
						return;
					}

					// A full sync was completed.
					console.log( 'Sync to sandbox completed.' );
					if ( ! shouldWatch ) {
						// We only needed to sync once, so we can resolve the sync promise.
						resolve();
					}
				}
			);
		} );

		if ( shouldWatch ) {
			chokidar.watch( localPath ).on( 'change', debouncedSync );
		} else {
			debouncedSync();
		}
	} );
}

/**
 * A debouncer that calls `cb` after it has not been called for at least 1s.
 */
function debouncer( cb ) {
	let timeout = null;
	return () => {
		console.log( 'debounce' );
		// Each time the debounced function is called, cancel the current schedule
		// and re-schedule it for +1s.
		clearTimeout( timeout );
		timeout = setTimeout( cb, 1000 );
	};
}

function showTips( tasks ) {
	if ( ! Array.isArray( tasks ) ) {
		return;
	}

	const tips = {
		'build:newspack-blocks': 'You may need to run `composer install` from wp-calypso root.',
	};

	const numFailed = tasks.reduce( ( total, { code } ) => total + ( code ? 1 : 0 ), 0 );
	if ( numFailed === tasks.length ) {
		console.log(
			'Since all builds failed, there is likely an issue with webpack or node modules.'
		);
		return;
	}

	// If only individual tasks failed, print individual tips.
	tasks.forEach( ( { code, name } ) => {
		if ( code !== 0 && tips[ name ] ) {
			console.log( tips[ name ] );
		}
	} );
}
