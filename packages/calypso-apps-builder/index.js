#!/usr/bin/env node

import { exec, spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import chokidar from 'chokidar';
import runAll from 'npm-run-all';
import treeKill from 'tree-kill';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// When we run a build which has more than 10 build tasks in parallel (like ETK),
// Node shows a warning. We just need to increase the number of allowed listeners
// to handle larger numbers of parallel tasks.
EventEmitter.setMaxListeners( 30 );

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
	// treeKill doesn't really work in CI and also isn't necessary.
	if ( process.env.IS_CI !== 'true' ) {
		const { pid } = process;
		if ( VERBOSE ) {
			console.log( `Removing children of PID: ${ pid }` );
		}
		treeKill( pid );
	}
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
	await Promise.all( [
		runAll( [ `build:*${ watch ? ' --watch' : '' }` ], runOpts ).then( () => {
			console.log( 'Build completed!' );
			const translate = runAll( 'translate', runOpts ).catch( () => {} );
			translate.then( () => {
				if ( ! watch && sync ) {
					// In non-watch + sync mode, we sync only once after the build has finished.
					setupRemoteSync( localPath, remotePath );
				}
			} );
		} ),
		// In watch + sync mode, we start watching to sync while the webpack build is happening.
		watch && sync && setupRemoteSync( localPath, remotePath, true ),
	] );

	// Create build_meta.json and copy the README as needed for the production
	// artifact. We do it here rather than in webpack, because several apps use
	// multiple simultaneous webpack processes. As a result, some apps don't have
	// one true config we could add this to. Thankfully, every calypso app does
	// use this builder script, making it a good place to put it.
	if ( ! watch ) {
		await copyMetaFiles( localPath );
	}
}

/**
 * Sets up remote syncing. In watch mode, schedules syncs to the remote after changes
 * have stopped happening and existing syncs have stopped. In non-watch mode, does
 * a single sync. Rejects if any errors happen during rsync. Resolves in non-watch
 * mode after a full sync. Is otherwise pending until the user kills the process.
 */
function setupRemoteSync( localPath, remotePath, shouldWatch = false ) {
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
			chokidar.watch( localPath ).on( 'all', debouncedSync );
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

	const numFailed = tasks.reduce( ( total, { code } ) => total + ( code ? 1 : 0 ), 0 );
	if ( numFailed === tasks.length ) {
		console.log(
			'Since all builds failed, there is likely an issue with webpack or node modules.'
		);
		return;
	}
}

function git( cmd ) {
	return spawnSync( 'git', cmd.split( ' ' ), {
		encoding: 'utf8',
	} ).stdout.replace( '\n', '' );
}

async function copyMetaFiles( archiveDir ) {
	const buildNumber = process.env.build_number;

	// Use commit hash from the environment if available. In TeamCity, that reflects
	// the GitHub data -- the local data may be different.
	const commitHash = process.env.commit_sha ?? git( 'rev-parse HEAD' );
	// Calypso repo short sha is currently at 11 characters.
	const cacheBuster = commitHash.slice( 0, 11 );

	const buildMeta = {
		build_number: buildNumber ?? 'dev',
		cache_buster: cacheBuster,
		commit_hash: commitHash,
		commit_url: `https://github.com/Automattic/wp-calypso/commit/${ commitHash }`,
	};

	await writeFile(
		path.join( archiveDir, 'build_meta.json' ),
		JSON.stringify( buildMeta, null, 2 )
	);

	// Copy README.md to the root of the archive.
	await copyFile( path.join( process.cwd(), 'README.md' ), path.join( archiveDir, 'README.md' ) );
}
