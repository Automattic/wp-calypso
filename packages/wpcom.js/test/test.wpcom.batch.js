/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * wpcom.batch
 */

describe( 'wpcom.batch', function() {
	it( 'should makes several data in only one request', function( done ) {
		var wpcom = util.wpcom();
		var batch = wpcom.batch();
		var site = wpcom.site( util.site() );

		var url_site = '/sites/' + site._id;
		var url_posts = '/sites/' + site._id + '/posts';
		var url_me = '/me';

		batch.add( url_site ).add( url_posts ).add( url_me ).run()
			.then( data => {
				assert.ok( data );
				assert.ok( data[url_site] );
				assert.ok( data[url_posts] );
				assert.ok( data[url_me] );
				done();
			} )
			.catch( done );
	} );
} );
