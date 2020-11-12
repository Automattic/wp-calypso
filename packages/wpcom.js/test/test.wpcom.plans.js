/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

describe( 'wpcom.plans', () => {
	// Global instances
	const wpcom = util.wpcom();
	const plans = wpcom.plans();

	describe( 'wpcom.plans.list', () => {
		it( 'should request current WordPress plans list', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.plans.features', () => {
		it( 'should request list of features of active WordPress.com plans', () => {
			return new Promise( ( done ) => {
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
} );
