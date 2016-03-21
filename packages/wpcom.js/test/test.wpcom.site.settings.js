/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.settings
 */
describe( 'wpcom.site.settings', function() {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var settings = site.settings();

	describe( 'wpcom.site.get', function() {
		it( 'should get site settings data', done => {
			settings.get()
				.then( data => {
					assert.ok( data );
					assert.ok( data.settings );
					done();
				} )
				.catch( done );
		} );

		it( 'should get `gmt_offset` option of site settings', done => {
			settings.getOption( 'gmt_offset' )
				.then( value => {
					assert.ok( typeof value !== 'undefined' );
					done();
				} )
				.catch( done );
		} );
	} );
} );
