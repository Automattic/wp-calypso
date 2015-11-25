
/**
 * Module dependencies
 */

var util = require( './util' );
var assert = require( 'assert' );

/**
 * Fixture data
 */

var fixture = require( './fixture' );

/**
 * Create a `Site` instance
 */

describe( 'apiVersion', function() {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );

	it( 'should request changing api version', done => {
		site.addMediaUrls( { apiVersion: '1.1' }, fixture.media.urls[1] )
			.then( data => {
				assert.ok( data );
				return site.mediaList( { apiVersion: '1' } )
			} )
			.then( () => site.addMediaFiles( { apiVersion: '1.1' }, fixture.media.files[0] ) )
			.then( data => {
				assert.ok( data );
				done();
			} )
			.catch( done );
	} );
} );
