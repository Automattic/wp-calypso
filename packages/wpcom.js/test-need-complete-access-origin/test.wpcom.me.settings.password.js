/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * me.settings.password
 */
describe( 'wpcom.me.settings.password', function () {
	// Global instances
	const wpcom = util.wpcom();
	const me = wpcom.me();
	const settings = me.settings();
	const password = settings.password();

	describe( 'wpcom.me.settings.password.validate', function () {
		it( "should don't pass `no_backslashes` validation", function () {
			return new Promise( ( done ) => {
				password.validate( '\\', ( err, data ) => {
					if ( err ) throw err;

					assert.ok( false === data.passed );

					const failed = data.test_results.failed[ 0 ];
					assert.equal( 'no_backslashes', failed.test_name );
					done();
				} );
			} );
		} );

		it( "should don't pass `minimunr_ length` validation", function () {
			return new Promise( ( done ) => {
				password.validate( '1', ( err, data ) => {
					if ( err ) throw err;

					assert.ok( false === data.passed );

					const failed = data.test_results.failed[ 0 ];
					assert.equal( 'minimum_length', failed.test_name );
					done();
				} );
			} );
		} );

		it( "should don't pass `not_a_common_password` validation", function () {
			return new Promise( ( done ) => {
				password.validate( '111111', ( err, data ) => {
					if ( err ) throw err;

					assert.ok( false === data.passed );

					const failed = data.test_results.failed[ 0 ];
					assert.equal( 'not_a_common_password', failed.test_name );
					done();
				} );
			} );
		} );
	} );
} );
