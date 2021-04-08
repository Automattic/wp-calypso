/* eslint no-magic-numbers: 0 */
'use strict';
// Filter by "group", which really means filename prefix, i.e:
//
//  --group=test/groupname
//  --group=test/abc/xyz/Regression
//  --group=test/abc/xyz/Smoke
//
var path = require( 'path' );
var logger = require( 'testarmada-logger' );

module.exports = function ( tests, partialFilename ) {
	logger.prefix = 'Mocha Plugin';

	if ( ! partialFilename ) {
		logger.log( 'No partial filename supplied to group filter, using all tests' );
		return tests;
	}

	if ( typeof partialFilename === 'string' ) {
		partialFilename = [ partialFilename ];
	}

	logger.log( 'Using group filter: ', partialFilename );
	return tests
		.filter( function ( t ) {
			return path.extname( t.filename ) === '.js';
		} )
		.filter( function ( t ) {
			return partialFilename.some( function ( pfn ) {
				return t.filename.indexOf( pfn ) !== -1;
			} );
		} );
};
