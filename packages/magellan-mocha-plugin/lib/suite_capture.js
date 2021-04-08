/* eslint valid-jsdoc: 0 */
'use strict';

var fs = require( 'fs' );
var _ = require( 'lodash' );

/**
 * Recursive function, takes a mocha test suite and returns a flattened list of
 * tagged suites found within
 */
function getSuites( suite, wantedTag ) {
	var suites = [];

	if ( suite.title.indexOf( '@' + wantedTag ) > -1 ) {
		// eslint-disable-line no-magic-numbers
		suites.push( {
			file: suite.file,
			title: suite.title,
			fullTitle: suite.fullTitle(),
			pending: suite.pending,
		} );
	}

	suite.suites.forEach( function ( s ) {
		suites = suites.concat( getSuites( s, wantedTag ) );
	} );

	return suites;
}

/**
 * Used as a mocha repoter for the test capturing phase
 */
module.exports = function ( runner, options ) {
	var outputPath = process.env.MOCHA_CAPTURE_PATH;
	if ( ! outputPath ) {
		throw new Error( 'Environment variable MOCHA_CAPTURE_PATH must be defined' );
	}

	// capture but do not run tests
	runner.run = function ( done ) {
		done();
	};

	// traverse suite structure and flattened list of tagged suites
	var suites = [];
	var wantedTags = options.reporterOptions.tags.split( ';' ).map( _.method( 'trim' ) );

	wantedTags.forEach( function ( wantedTag ) {
		suites = suites.concat( getSuites( runner.suite, wantedTag ) );
	} );

	// process .only greps
	if ( options.grep ) {
		suites = suites.filter( function ( t ) {
			return t.fullTitle.match( options.grep );
		} );
	}

	fs.writeFileSync( process.env.MOCHA_CAPTURE_PATH, JSON.stringify( suites ) );
};
