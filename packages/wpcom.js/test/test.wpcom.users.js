/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * me
 */

describe( 'wpcom.users', function () {
	// Global instances
	var wpcom = util.wpcom();
	var users = wpcom.users();

	describe( 'wpcom.users.suggets', function () {
		it( 'should get a list of possible users to suggest.', ( done ) => {
			users
				.suggest()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( 'object', typeof data.suggestions );
					assert.ok( data.suggestions instanceof Array );

					done();
				} )
				.catch( done );
		} );
	} );
} );
