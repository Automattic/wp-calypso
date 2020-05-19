/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

describe( 'wpcom.site.post.like', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var testing_post;

	// Create a testing_post before to start the tests
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

	describe( 'wpcom.site.post.like.add', function () {
		it( 'should add a post like', ( done ) => {
			testing_post
				.like()
				.add()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.success );
					assert.ok( data.i_like );
					assert.equal( 1, data.like_count );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.like.mine', function () {
		it( 'should get the post like status of mine', ( done ) => {
			testing_post
				.like()
				.mine()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( 1, data.like_count );
					assert.ok( data.i_like );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.likesList', function () {
		it( 'should get post likes list', ( done ) => {
			testing_post
				.likesList()
				.then( ( data ) => {
					assert.ok( data );

					assert.equal( 'number', typeof data.found );
					assert.equal( 'boolean', typeof data.i_like );
					assert.equal( 'object', typeof data.likes );
					assert.ok( data.likes instanceof Array );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.like.delete', function () {
		it( 'should remove your like from the post', ( done ) => {
			testing_post
				.like()
				.del()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.success );
					assert.equal( 0, data.like_count );
					assert.ok( ! data.i_like );

					done();
				} )
				.catch( done );
		} );
	} );
} );
