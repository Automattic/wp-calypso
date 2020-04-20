/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * me.twoStep
 */
describe( 'wpcom.me.twoStep', function () {
	// Global instances
	var wpcom = util.wpcom();
	var me = wpcom.me();
	var twoStep = me.twoStep();

	describe( 'wpcom.me.twoStep.get', function () {
		it( "should get current user' two-step auth configuration", function ( done ) {
			twoStep.get( ( err, data ) => {
				if ( err ) throw err;

				assert.ok( data );
				done();
			} );
		} );
	} );
} );
