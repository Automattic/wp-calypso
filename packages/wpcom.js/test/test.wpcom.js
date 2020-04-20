/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

describe( 'wpcom', function () {
	describe( 'wpcom.freshlyPressed', function () {
		it( 'should require freshly pressed', function ( done ) {
			var wpcom = util.wpcomPublic();

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
