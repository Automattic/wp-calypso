/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * site.domain
 */
describe( 'wpcom.site.domain', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const domain = site.domain();

	describe( 'wpcom.site.domain', function () {
		it( 'should get primary domain of the site', () => {
			return new Promise( ( done ) => {
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
} );
