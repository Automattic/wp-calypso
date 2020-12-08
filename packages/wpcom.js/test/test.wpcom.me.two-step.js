/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * me.twoStep
 */
describe( 'wpcom.me.twoStep', function () {
	// Global instances
	const wpcom = util.wpcom();
	const me = wpcom.me();
	const twoStep = me.twoStep();

	describe( 'wpcom.me.twoStep.get', function () {
		it( "should get current user' two-step auth configuration", function () {
			return new Promise( ( done ) => {
				twoStep.get( ( err, data ) => {
					if ( err ) throw err;

					assert.ok( data );
					done();
				} );
			} );
		} );
	} );
} );
