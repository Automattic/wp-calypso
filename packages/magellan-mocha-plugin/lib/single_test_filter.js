'use strict';

var path = require( 'path' );
var logger = require( 'testarmada-logger' );

// Filter by one exact relative filename match, eg:
// --test=path/to/exact/test/filename.js
module.exports = function ( tests, filename ) {
	logger.prefix = 'Mocha Plugin';
	logger.log( 'Using mocha test filter: ', filename );

	return tests.filter( function ( test ) {
		var fileArray = filename.split( ',' );
		if ( fileArray instanceof Array ) {
			for ( var i = 0; i < fileArray.length; i++ ) {
				if ( path.resolve( test.filename.trim() ) === path.resolve( fileArray[ i ].trim() ) ) {
					return true;
				}
			}
		}
	} );
};
