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
 * wpcom.site.post
 */
describe( 'wpcom.site.post', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var site_ID;
	var testing_post;

	// Create a testing_post before to start the tests
	before( ( done ) => {
		site
			.addPost( fixture.post )
			.then( ( data_post ) => {
				testing_post = data_post;

				return site.get();
			} )
			.then( ( data_site ) => {
				site_ID = data_site.ID;

				done();
			} )
			.catch( done );
	} );

	after( ( done ) => {
		// delete testing_post post
		site
			.deletePost( testing_post.ID )
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.post.get', function () {
		it( 'should get added post ( by id )', ( done ) => {
			site
				.post( testing_post.ID )
				.get()
				.then( ( data ) => {
					assert.equal( testing_post.ID, data.ID );
					assert.equal( testing_post.site_ID, data.site_ID );
					done();
				} )
				.catch( done );
		} );

		it( 'should get passing a query object', ( done ) => {
			site
				.post( testing_post.ID )
				.get( { content: 'edit' } )
				.then( ( post ) => {
					assert.equal( testing_post.ID, post.ID );
					assert.equal( testing_post.site_ID, post.site_ID );
					done();
				} )
				.catch( done );
		} );

		it( 'should get added post ( by slug )', ( done ) => {
			site
				.post( { slug: testing_post.slug } )
				.get()
				.then( ( post ) => {
					assert.equal( testing_post.ID, post.ID );
					assert.equal( testing_post.site_ID, post.site_ID );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.add', function () {
		it( 'should add a new post', ( done ) => {
			fixture.post.title += '-added';

			site
				.post()
				.add( fixture.post )
				.then( ( data ) => {
					// checking some data date
					assert.ok( data );
					assert.ok( data instanceof Object, 'data is not an object' );
					assert.equal( site_ID, data.site_ID );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.update', function () {
		it( 'should edit the new added post', ( done ) => {
			var new_title = fixture.post.title + '-updated';

			site
				.post( testing_post.ID )
				.update( { title: new_title } )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( new_title, data.title );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.delete', function () {
		it( 'should delete the new added post', ( done ) => {
			site
				.post( testing_post.ID )
				.delete()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( testing_post.ID, data.ID );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.del', function () {
		it( 'should delete the post using del()', ( done ) => {
			let test_post;
			site
				.addPost( fixture.post )
				.then( ( data_post ) => {
					test_post = data_post;
					return data_post;
				} )
				.then( ( data_post ) => {
					return site.post( data_post.ID ).del();
				} )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( test_post.ID, data.ID );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.post.restore', function () {
		it( 'should restore a post from trash', ( done ) => {
			var post = site.post();

			post
				.add( fixture.post )
				.then( ( data ) => {
					assert.equal( post._id, data.ID );

					return post.delete();
				} )
				.then( ( data ) => {
					assert.equal( post._id, data.ID );

					return post.restore();
				} )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( post._id, data.ID );
					assert.equal( testing_post.status, data.status );

					return post.delete();
				} )
				.then( ( data ) => {
					assert.equal( post._id, data.ID );
					done();
				} )
				.catch( done );
		} );
	} );
} );
