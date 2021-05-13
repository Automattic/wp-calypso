/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import util from './util';

/**
 * site.settings
 */
describe( 'wpcom.site.settings', () => {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const settings = site.settings();

	describe( 'wpcom.site.get', () => {
		it( 'should get site settings data', () => {
			return new Promise( ( done ) => {
				settings
					.get()
					.then( ( data ) => {
						assert.ok( data );
						assert.ok( data.settings );
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
	} );
} );
