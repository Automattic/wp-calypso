/**
 * Module dependencies
 */
var util = require( './util' );

function trueAssertion( done ) {
	return function () {
		done();
	};
}

function falseAssertion( done ) {
	return function () {
		done( new Error( 'Failed!' ) );
	};
}

describe( 'wpcom', function () {
	var wpcom = util.wpcomPublic();

	describe( 'wpcom.promises', function () {
		it( 'should fail when slower than timeout', ( done ) => {
			wpcom
				.site( util.site() )
				.postsList()
				.timeout( 10 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		} );

		it( 'should still catch() with timeout()', ( done ) => {
			wpcom
				.site( util.site() )
				.post( -5 )
				.get()
				.timeout( 10000 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		} );
	} );
} );
