/**
 * Module dependencies
 */
const util = require( './util' );
// @todo Update these tests to use jest.expect
// eslint-disable-next-line
const assert = require( 'assert' );

/**
 * site.settings
 */
describe( '[access-origin] wpcom.site.settings', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const settings = site.settings();
	let current_settings;

	describe( 'wpcom.site.get', function () {
		it( 'should get site settings data', () => {
			return new Promise( ( done ) => {
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
		} );

		it( 'should get `gmt_offset` option of site settings', () => {
			return new Promise( ( done ) => {
				settings
					.getOption( 'gmt_offset' )
					.then( ( value ) => {
						assert.ok( typeof value !== 'undefined' );
						done();
					} )
					.catch( done );
			} );
		} );

		it( 'should update site settings', () => {
			return new Promise( ( done ) => {
				settings
					.update( { blogname: current_settings.name + ' (Updated)' } )
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );

		it( 'should set `blogname` option', () => {
			return new Promise( ( done ) => {
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
} );
