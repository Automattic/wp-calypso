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
				syncToRemote( localPath, remotePath );
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
		syncToRemote( localPath, remotePath, true );
	}
}

function syncToRemote( localPath, remotePath, watch = false ) {
	const debouncedSync = debouncer( () => {
		console.info( 'Performing sync...' );
		exec( `rsync -ahz --exclude=".*" ${ localPath } wpcom-sandbox:${ remotePath }` );
	} );
	if ( watch ) {
		chokidar.watch( localPath ).on( 'change', debouncedSync );
	} else {
		debouncedSync();
	}
}

// A debouncer that does the following:
// - Calls the func immediately if no calls happened in the past 500ms. (Such as
//   the first time the debounced function is called.)
// - Calls func again only after further calls have stopped for 500ms. (Does not
//   call func if no calls happened after the first time.)
function debouncer( func, delayMs = 500 ) {
	let timeout = null;
	let calledWithTimeout = false;
	return () => {
		if ( ! timeout ) {
			func();
		} else {
			calledWithTimeout = true;
		}
		clearTimeout( timeout );
		timeout = setTimeout( () => {
			if ( calledWithTimeout ) {
				func();
				calledWithTimeout = false;
			}
		}, delayMs );
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

	tasks.forEach( ( task ) => {
		if ( task.code !== 0 && tips[ task.name ] ) {
			console.log( tips[ task.name ] );
		}
	} );
}
