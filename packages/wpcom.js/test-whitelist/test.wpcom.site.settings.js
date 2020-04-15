/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.settings
 */
describe( '[whitelist] wpcom.site.settings', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var settings = site.settings();
	var current_settings;

	describe( 'wpcom.site.get', function () {
		it( 'should get site settings data', ( done ) => {
			settings
				.get()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.settings );
					current_settings = data;
					done();
				} )
				.catch( done );
		} );

		it( 'should get `gmt_offset` option of site settings', ( done ) => {
			settings
				.getOption( 'gmt_offset' )
				.then( ( value ) => {
					assert.ok( typeof value !== 'undefined' );
					done();
				} )
				.catch( done );
		} );

		it( 'should update site settings', ( done ) => {
			settings
				.update( { blogname: current_settings.name + ' (Updated)' } )
				.then( ( data ) => {
					assert.ok( data );
					done();
				} )
				.catch( done );
		} );

		it( 'should set `blogname` option', ( done ) => {
			settings
				.setOption( 'blogname', current_settings.name )
				.then( ( res ) => {
					assert.ok( typeof res !== 'undefined' );
					assert.ok( res.updated.blogname === current_settings.name );
					done();
				} )
				.catch( done );
		} );
	} );
} );
