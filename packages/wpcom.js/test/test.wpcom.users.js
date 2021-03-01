/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * me
 */

describe( 'wpcom.users', function () {
	// Global instances
	const wpcom = util.wpcom();
	const users = wpcom.users();

	describe( 'wpcom.users.suggets', function () {
		it( 'should get a list of possible users to suggest.', () => {
			return new Promise( ( done ) => {
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
} );
