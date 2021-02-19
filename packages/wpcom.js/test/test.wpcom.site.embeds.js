/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

describe( 'wpcom.site.embeds', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );

	describe( "wpcom.site.renderEmbed('embed' )", function () {
		it( 'should render embed', () => {
			return new Promise( ( done ) => {
				site
					.renderEmbed( fixture.embed )
					.then( ( data ) => {
						assert.equal( data.embed_url, fixture.embed );
						assert.ok( data.result );
						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
