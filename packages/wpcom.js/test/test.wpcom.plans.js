/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

describe( 'wpcom.plans', () => {
	// Global instances
	const wpcom = util.wpcom();
	const plans = wpcom.plans();

	describe( 'wpcom.plans.list', () => {
		it( 'should request current WordPress plans list', ( done ) => {
			plans
				.list()
				.then( ( data ) => {
					assert.equal( 'object', typeof data );
					assert.ok( data instanceof Array );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.plans.features', () => {
		it( 'should request list of features of active WordPress.com plans', ( done ) => {
			plans
				.features()
				.then( ( data ) => {
					assert.equal( 'object', typeof data );
					assert.ok( data instanceof Array );
					done();
				} )
				.catch( done );
		} );
	} );
} );
