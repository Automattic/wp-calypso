/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */
/* eslint-disable no-process-exit */
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import runAll from 'npm-run-all';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// When we run a build which has more than 10 build tasks in parallel (like ETK),
// Node shows a warning. We just need to increase the number of allowed listeners
// to handle larger numbers of parallel tasks.
EventEmitter.setMaxListeners( 20 );

// Default NODE_ENV is development unless manually set to production.
if ( ! process.env.NODE_ENV ) {
	process.env.NODE_ENV = 'development';
}
if ( ! process.env.BROWSERSLIST_ENV ) {
	process.env.BROWSERSLIST_ENV = 'wpcom';
}
if ( ! process.env.DISABLE_DUPLICATE_PACKAGE_CHECK ) {
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
} );
await runBuilder( argv );

async function runBuilder( { sync, localPath, remotePath, verbose } ) {
	const shouldWatch = process.env.NODE_ENV === 'development';

	if ( verbose ) {
		console.info( `Watch mode: ${ shouldWatch ? 'yes' : 'no' }\nSync mode: ${
			sync ? 'yes' : 'no'
		}\nLocal path: ${ localPath }\nRemote path: ${ remotePath }
		` );
	}

	const runOpts = {
		stdout: process.stdout,
		stderr: process.stderr,
		printLabel: true,
	};
	console.log( 'Cleaning...' );
	await runAll( 'clean', runOpts );

	console.log( 'Starting webpack...' );
	// Run build tasks in parallel
	runAll( [ 'build:*' ], { ...runOpts, parallel: true } )
		.then( () => {
			console.log( 'Build completed!' );
			if ( ! shouldWatch && sync ) {
				// In non-watch + sync mode, we sync only once after the build has finished.
				setupRemoteSync( localPath, remotePath );
			}
		} )
		.catch( ( e ) => {
			console.error( 'The build failed.' );
			console.error( `Reported build error: ${ e.message }` );
			showTips( e.results );
			process.exit( 1 );
		} );

	// In dev mode, we start watching to sync while the webpack build is happening.
	if ( shouldWatch && sync ) {
		setupRemoteSync( localPath, remotePath, true );
	}
}

/**
 * Sets up remote syncing. In watch mode, schedules syncs to the remote after changes
 * have stoped happening and existing syncs have stopped. In non-watch mode, does
 * a single sync.
 *
 * @param localPath   The path to the changes to watch locally.
 * @param remotePath  The path the changes should be synced to on the sandbox.
 * @param shouldWatch Whether to watch for changes.
 */
function setupRemoteSync( localPath, remotePath, shouldWatch = false ) {
	let rsync = null;
	const debouncedSync = debouncer( () => {
		console.info( 'Performing sync...' );
		if ( rsync ) {
			rsync.kill();
		}
		rsync = exec(
			`rsync -ahz --exclude=".*" ${ localPath } wpcom-sandbox:${ remotePath }`,
			( err ) => {
				rsync = null;
				// SIGTERM is how we manually kill an existing rsync process so
				// it's not an error condition for our program.
				if ( err && err.signal !== 'SIGTERM' ) {
					throw err;
				}
			}
		);
	} );

	if ( shouldWatch ) {
		chokidar.watch( localPath ).on( 'change', debouncedSync );
	} else {
		debouncedSync();
	}
}

/**
 * A debouncer that calls `cb` after it has not been called for at least 1s.
 *
 * @param cb A function to call after other debouncing is completed.
 */
function debouncer( cb ) {
	let timeout = null;
	return () => {
		// Each time the debounced function is called, cancel the current schedule
		// and re-schedule it for +1s.
		clearTimeout( timeout );
		timeout = setTimeout( cb, 1000 );
	};
}

// Based on the completed tasks, show tips.
function showTips( tasks ) {
	if ( ! Array.isArray( tasks ) ) {
		return;
	}

	const tips = {
		'build:newspack-blocks': 'You may need to run `composer install` from wp-calypso root.',
	};

	const numFailed = tasks.reduce( ( total, { code } ) => total + ( code ? 1 : 0 ), 0 );
	if ( numFailed === tasks.length ) {
		console.info(
			'Since all builds failed, there is likely an issue with webpack or node modules.'
		);
		return;
	}

	// If only individual tasks failed, print individual tips.
	tasks.forEach( ( { code, name } ) => {
		if ( code !== 0 && tips[ name ] ) {
			console.info( tips[ name ] );
		}
	} );
}
