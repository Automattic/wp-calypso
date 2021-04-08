const _ = require( 'lodash' );
const clc = require( 'cli-color' );
const fs = require( 'fs' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;
const Locator = require( './locator' );
const mochaSettings = require( './settings' );
const logger = require( 'testarmada-logger' );
const pkgUp = require( 'pkg-up' );

module.exports = function ( settings ) {
	logger.prefix = 'Mocha Plugin';
	const OUTPUT_PATH = path.resolve( settings.tempDir, 'get_mocha_tests.json' );
	let reporter = path.resolve( __dirname, 'test_capture.js' );

	if ( ! fs.existsSync( settings.tempDir ) ) {
		fs.mkdirSync( settings.tempDir );
	}

	const mochaDir = path.dirname(
		pkgUp.sync( { cwd: path.dirname( require.resolve( 'mocha' ) ) } )
	);
	const cmd = path.join( mochaDir, './bin/mocha' );
	let args = [];

	if ( mochaSettings.suiteTag !== undefined ) {
		reporter = path.resolve( __dirname, 'suite_capture.js' );
		args.push( '--reporter-options', 'tags=' + mochaSettings.suiteTag );
	}

	args.push( '--reporter', reporter );

	/* istanbul ignore else */
	if ( mochaSettings.mochaOpts ) {
		args.push( '--opts', mochaSettings.mochaOpts );
	}

	args = args.concat( mochaSettings.mochaTestFolders );
	const env = _.extend( {}, process.env, { MOCHA_CAPTURE_PATH: OUTPUT_PATH } );
	const capture = spawnSync( cmd, args, { env: env } );

	/* istanbul ignore next */
	if ( capture.status !== 0 ) {
		logger.err(
			'Could not capture mocha tests. To debug, run the following command:\n' +
				'MOCHA_CAPTURE_PATH=%s %s %s',
			OUTPUT_PATH,
			cmd,
			args.join( ' ' )
		);
		process.exit( 1 );
	}
	logger.log( 'Scanning test files for tests ...' );

	let tests = fs.readFileSync( OUTPUT_PATH, 'utf-8' );
	fs.unlinkSync( OUTPUT_PATH );

	tests = JSON.parse( tests ).map( function ( t ) {
		return new Locator( t.fullTitle, t.file, t.pending, t.title );
	} );

	logger.log( clc.green( 'Found ' + tests.length + ' tests in test files' ) );

	return tests;
};
