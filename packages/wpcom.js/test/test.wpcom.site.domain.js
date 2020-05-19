/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.domain
 */
describe( 'wpcom.site.domain', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var domain = site.domain();

	describe( 'wpcom.site.domain', function () {
		it( 'should get primary domain of the site', ( done ) => {
			domain
				.getPrimary()
				.then( ( data ) => {
					assert.ok( data );
					done();
				} )
				.catch( done );
		} );
	} );
} );
