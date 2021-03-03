/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

describe( 'wpcom', function () {
	describe( 'wpcom.freshlyPressed', function () {
		it( 'should require freshly pressed', function () {
			return new Promise( ( done ) => {
				const wpcom = util.wpcomPublic();

				wpcom
					.freshlyPressed()
					.then( ( data ) => {
						// testing object
						assert.ok( data );
						assert.equal( 'number', typeof data.number );
						assert.ok( data.posts instanceof Array );
						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
