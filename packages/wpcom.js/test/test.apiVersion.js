/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import util from './util';

/**
 * Fixture data
 */
import fixture from './fixture';

/**
 * Test api versions
 */
describe( 'apiVersion', () => {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );

	it( 'should request changing api version', ( done ) => {
		site
			.addMediaUrls( { apiVersion: '1.1' }, fixture.media.urls[ 1 ] )
			.then( ( data ) => {
				assert.ok( data );
				return site.mediaList( { apiVersion: '1' } );
			} )
			.then( () => site.addMediaFiles( { apiVersion: '1.1' }, fixture.media.files[ 0 ] ) )
			.then( ( data ) => {
				assert.ok( data );
				done();
			} )
			.catch( done );
	} );
} );
