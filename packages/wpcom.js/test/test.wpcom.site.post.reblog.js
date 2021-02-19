/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

/**
 * site.post.reblog
 */
describe( 'wpcom.site.post.reblog', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const testing_reblog_post = wpcom
		.site( fixture.reblog.original_blog )
		.post( fixture.reblog.original_post );
	let testing_post;

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
		it( 'should reblog the added post', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.site.post.reblog.to', function () {
		it( 'should get reblog the added post', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.site.post.reblog.mine', function () {
		it( 'should get the post reblog status of mine', () => {
			return new Promise( ( done ) => {
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
} );
