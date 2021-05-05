const fs = require( 'fs' );

/**
 * Recursive function, takes a mocha test suite and returns a flattened list of
 * test found within
 *
 * @param suite The suite to run
 */
function getTests( suite ) {
	let tests = [];

	suite.tests.forEach( function ( t ) {
		tests.push( {
			file: t.file,
			title: t.title,
			fullTitle: t.fullTitle(),
			pending: t.pending,
		} );
	} );

	suite.suites.forEach( function ( s ) {
		tests = tests.concat( getTests( s ) );
	} );

	return tests;
}

/**
 * Used as a mocha repoter for the test capturing phase
 *
 * @param runner The runner
 * @param options Options passed to the runner
 */
module.exports = function ( runner, options ) {
	const outputPath = process.env.MOCHA_CAPTURE_PATH;
	if ( ! outputPath ) {
		throw new Error( 'Environment variable MOCHA_CAPTURE_PATH must be defined' );
	}

	// capture but do not run tests
	runner.run = function ( done ) {
		done();
	};

	// traverse suite structure and flattened list of tests
	let tests = getTests( runner.suite );

	// process .only greps
	if ( options.grep ) {
		tests = tests.filter( function ( t ) {
			return t.fullTitle.match( options.grep );
		} );
	}

	fs.writeFileSync( process.env.MOCHA_CAPTURE_PATH, JSON.stringify( tests ) );
};
