/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

/**
 * site.post.reblog
 */
describe( 'wpcom.site.post.reblog', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var testing_reblog_post = wpcom
		.site( fixture.reblog.original_blog )
		.post( fixture.reblog.original_post );
	var testing_post;

	// Create a testing_post before to start tests
	before( ( done ) => {
		site
			.addPost( fixture.post )
			.then( ( data ) => {
				testing_post = site.post( data.ID );
				done();
			} )
			.catch( done );
	} );

	after( ( done ) => {
		// delete testing_post post
		testing_post
			.delete()
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.post.reblog.add', function () {
		it( 'should reblog the added post', ( done ) => {
			testing_reblog_post
				.reblog()
				.add( {
					note: fixture.reblog.note,
					destination_site_id: site._id,
				} )
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.can_reblog );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.reblog.to', function () {
		it( 'should get reblog the added post', ( done ) => {
			testing_reblog_post
				.reblog()
				.to( site._id, fixture.reblog.note + '-to' )
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.can_reblog );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.reblog.mine', function () {
		it( 'should get the post reblog status of mine', ( done ) => {
			testing_post
				.reblog()
				.mine()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.can_reblog );
					done();
				} )
				.catch( done );
		} );
	} );
} );
