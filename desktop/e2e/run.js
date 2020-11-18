#!/usr/bin/env node

/* eslint-disable no-process-exit*/
/* eslint-disable import/no-nodejs-modules*/

const path = require( 'path' );
const electron = require( 'electron' );
const { promisify } = require( 'util' );
const { openSync, mkdirSync } = require( 'fs' );
const { execSync, spawn } = require( 'child_process' );
const videoRecorder = require( './tests/lib/video-recorder' );

const PROJECT_DIR = path.join( __dirname, '../' );
const E2E_DIR = path.join( PROJECT_DIR, 'e2e' );

const APP_ARGS = [
	'--disable-renderer-backgrounding',
	'--disable-http-cache',
	'--start-maximized',
	'--remote-debugging-port=9222',
];

let BUILT_APP_DIR;
let SPAWN_CMD;
let CWD;

switch ( process.platform ) {
	case 'darwin':
		BUILT_APP_DIR = path.join(
			PROJECT_DIR,
			'release',
			'mac',
			'WordPress.com.app',
			'Contents',
			'MacOS'
		);
		CWD = BUILT_APP_DIR;
		SPAWN_CMD = './WordPress.com';
		break;
	case 'linux':
		BUILT_APP_DIR = path.join( PROJECT_DIR, 'release', 'linux-unpacked', 'resources', 'app' );
		APP_ARGS.unshift( BUILT_APP_DIR );
		CWD = path.dirname( electron );
		SPAWN_CMD = './electron';
		break;
	default:
		throw 'unsupported platform!';
}

function spawnDetached( cwd, command, args, output, env ) {
	const stdio = output ? [ 'ignore', output, output ] : null;
	const app = spawn( command, args, { stdio, detached: true, env, cwd } );
	app.on( 'error', ( err ) => {
		throw `failed to initialize command "${ command }": "${ err }"`;
	} );
	return app;
}

function initLogs( timestamp ) {
	const dir = path.join( E2E_DIR, 'logs', `${ timestamp }` );

	mkdirSync( dir, { recursive: true } );

	const appLogPath = path.join( dir, `app-${ timestamp }.log` );
	const driverLogPath = path.join( dir, `chromedriver-${ timestamp }.log` );
	const electronLogPath = path.join( dir, `electron-${ timestamp }.log` );

	const appLogFd = openSync( appLogPath, 'a' );
	const driverLogFd = openSync( driverLogPath, 'a' );
	const electronLogFd = openSync( electronLogPath, 'a' );

	if ( ! appLogFd || ! driverLogFd || ! electronLogFd ) {
		throw 'failed to initialize logs';
	}

	const appLog = { path: appLogPath, fd: appLogFd };
	const driverLog = { path: driverLogPath, fd: driverLogFd };
	const electronLog = { path: electronLogPath, fd: electronLogFd };

	return { appLog, driverLog, electronLog };
}

const delay = promisify( setTimeout );

let app;
let driver;

function handleExit() {
	if ( driver ) {
		driver.kill();
	}
	if ( app ) {
		app.kill();
	}
}

// Handle both user-initiated (SIGINT) and normal termination.
process.on( 'SIGINT', function () {
	handleExit();
	process.exit();
} );

process.on( 'exit', handleExit );

async function run() {
	try {
		const requiredENVs = [ 'E2EGUTENBERGUSER', 'E2EPASSWORD' ];
		const missingENVs = requiredENVs.filter(
			( name ) => ! process.env[ name ] || process.env[ name ] === ''
		);
		if ( missingENVs.length ) {
			throw `Missing non-empty ENV for: ${ missingENVs.join( ', ' ) }`;
		}

		// Replace `:` with `-` to format timestamp as YYYY-MM-DDTHH-MM-SS.mmmZ
		const timestamp = new Date().toJSON().replace( /:/g, '-' );
		const { appLog, driverLog, electronLog } = initLogs( timestamp );

		await videoRecorder.startVideo();

		const parentEnv = process.env;
		app = spawnDetached( CWD, SPAWN_CMD, APP_ARGS, electronLog.fd, {
			WP_DEBUG_LOG: appLog.path,
			DEBUG: true,
			...parentEnv,
		} );

		await delay( 5000 );

		driver = spawnDetached(
			PROJECT_DIR,
			'npx',
			[ 'chromedriver', '--port=9515', '--verbose' ],
			driverLog.fd
		);

		const tests = path.join( E2E_DIR, 'tests', 'e2e.js' );
		const reporterOptions = path.join( E2E_DIR, 'mocha-reporter.json' );
		execSync(
			`npx mocha ${ tests } --timeout 20000 --exit --reporter mocha-multi-reporters --reporter-options configFile=${ reporterOptions }`,
			{
				cwd: PROJECT_DIR,
				stdio: 'inherit',
			}
		);
	} catch ( err ) {
		console.error( err ); // eslint-disable-line no-console
		process.exitCode = 1;
	} finally {
		await videoRecorder.stopVideo();

		// Explicitly call process.exit to ensure that spawned processes are killed.
		process.exit();
	}
}

run();
