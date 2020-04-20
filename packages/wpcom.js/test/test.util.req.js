/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

describe( 'wpcom', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var testing_post;

	describe( 'wpcom.util.req.post', function () {
		describe( 'create a post without query {} and body {}', function () {
			it( 'should get 400 error code', function ( done ) {
				var path = '/sites/' + site._id + '/posts/new';
				wpcom.req
					.post( path )
					.then( () => done( 'No error returned' ) )
					.catch( ( err ) => {
						assert.ok( err );
						assert.equal( 400, err.statusCode );
						done();
					} );
			} );
		} );

		describe( 'create a post without query {}', function () {
			it( 'should create a new post', function ( done ) {
				var path = '/sites/' + site._id + '/posts/new';
				wpcom.req
					.post( path, null, fixture.post )
					.then( ( data ) => {
						testing_post = data;
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.util.req.del', function () {
		it( 'should delete added post', function ( done ) {
			var path = '/sites/' + site._id + '/posts/' + testing_post.ID + '/delete';
			wpcom.req
				.post( path )
				.then( ( data ) => {
					assert.ok( data.ID, testing_post.ID );
					done();
				} )
				.catch( done );
		} );
	} );
} );
