#!/usr/bin/env node
'use strict'; // eslint-disable-line strict

require( 'babel-register' );

/**
 * External dependencies
 */
const debug = require( 'debug' )( 'test-runner' ),
	glob = require( 'glob' ),
	Mocha = require( 'mocha' ),
	program = require( 'commander' ),
	watchFile = require( 'fs' ).watchFile,
	fs = require( 'fs' ),
	isEmpty = require( 'lodash/isEmpty' ),
	chalk = require( 'chalk' );

/**
 * Internal dependencies
 */

program
	.usage( '[options] [files]' )
	.option( '-R, --reporter <name>', 'specify the reporter to use', 'spec' )
	.option( '-t, --node-total <n>', 'specify the node total to use', parseInt )
	.option( '-i, --node-index <n>', 'specify the node index to use', parseInt )
	.option( '-g, --grep <pattern>', 'only run tests matching <pattern>' )
	.option( '-w, --watch', 'watch files for changes' );

program.name = 'runner';

program.parse( process.argv );

const getTestFiles = () => {
	let testFiles = program.args;
	if ( isEmpty( program.args ) ) {
		testFiles = [ process.env.TEST_ROOT ];
	}

	testFiles = testFiles.reduce( ( memo, filePath ) => {
		// If you pass in a test file outside of the test root throw a warning
		if ( ! filePath.startsWith( process.env.TEST_ROOT ) ) {
			console.warn(
				chalk.red.bold( 'WARNING:' ),
				chalk.yellow( 'Invalid argument passed to test runner. Paths must match test root `' + process.env.TEST_ROOT + '`.' )
			);
			console.warn( ' - ' + filePath + '\n' );
			return memo;
		}

		if ( fs.lstatSync( filePath ).isDirectory() ) {
			const globOptions = { matchBase: true, cwd: filePath, realpath: true };

			// recursively take all test subdirs if they exist
			let matches = glob.sync( '**/test/*.@(js|jsx)', globOptions );

			// if already given a test dir then take all js files
			if ( /test\/?$/.test( filePath ) ) {
				matches = matches.concat( glob.sync( '*.@(js|jsx)', globOptions ) );
			}

			return memo.concat( memo, matches );
		}

		return memo.concat( memo, filePath );
	}, [] );

	if ( program.nodeTotal > 1 ) {
		testFiles = testFiles.filter( ( file, index ) => {
			return index % program.nodeTotal === program.nodeIndex;
		} );
	}

	return testFiles;
};

const getMocha = function() {
	const boot = require( './boot-test' );

	const mocha = new Mocha( {
		ui: 'bdd',
		reporter: program.reporter
	} );

	mocha.suite.beforeAll( boot.before );
	mocha.suite.afterAll( boot.after );

	if ( program.grep ) {
		mocha.grep( new RegExp( program.grep ) );
	}

	if ( process.env.CIRCLECI ) {
		debug( 'Hello Circle!' );
		// give circle more time by default because containers are slow
		// why 10 seconds? a guess.
		mocha.suite.timeout( 10000 );
	}

	mocha.files = getTestFiles();
	return mocha;
};

let runner = null;
const runMocha = () => {
	console.log( chalk.green( 'Running tests at: ' ),
		chalk.yellow( new Date() ) );

	runner = getMocha().run( ( failures ) => {
		runner = null;
		process.exitCode = failures;
	} );
};

if ( program.watch ) {
	console.log( chalk.green( 'Watch mode enabled' ) );

	const watchFiles = glob.sync( '**/*.@(js|jsx)', { ignore: 'node_modules/**' } );
	const options = { interval: 100 };
	watchFiles.forEach( ( file ) => {
		watchFile( file, options, () => {
			if ( runner ) {
				runner.abort();
			}
			// aborting is not instant, so wait for it to finish
			// then call run the test-suite again
			const abortedCheck = setInterval( () => {
				if ( runner === null ) {
					clearInterval( abortedCheck );

					// Must purge the cache in case any files have been modified
					Object.keys( require.cache ).forEach( ( key ) => {
						delete require.cache[ key ];
					} );
					runMocha();
				}
			}, 25 );
		} );
	} );
}

runMocha();

