/**
 * Module dependencies
 */
const util = require( './util' );

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
	const wpcom = util.wpcomPublic();

	describe( 'wpcom.promises', function () {
		// eslint-disable-next-line jest/expect-expect
		it( 'should fail when slower than timeout', () => {
			return new Promise( ( done ) => {
				wpcom
					.site( util.site() )
					.postsList()
					.timeout( 10 )
					.then( falseAssertion( done ) )
					.catch( trueAssertion( done ) );
			} );
		} );

		// eslint-disable-next-line jest/expect-expect
		it( 'should still catch() with timeout()', () => {
			return new Promise( ( done ) => {
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
} );
