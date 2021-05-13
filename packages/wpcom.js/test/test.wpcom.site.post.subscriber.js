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
 * wpcom.site.post.subscriber
 */
describe( 'wpcom.site.post.subscriber', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( fixture.site );
	let testing_post;

	before( function ( done ) {
		site.addPost( fixture.post, function ( err, data ) {
			if ( err ) throw err;

			testing_post = site.post( data.ID );
			done();
		} );
	} );

	after( function ( done ) {
		// delete testing_post post
		testing_post.delete( function ( err ) {
			if ( err ) throw err;

			done();
		} );
	} );

	describe( 'wpcom.site.post.subscribersList', function () {
		it( 'should get subscribers post list', function () {
			return new Promise( ( done ) => {
				testing_post.subscribersList( function ( err, data ) {
					if ( err ) throw err;

					assert.equal( 'number', typeof data.found );
					assert.equal( 0, data.found );
					assert.equal( 'object', typeof data.subscriptions );
					assert.ok( data.subscriptions instanceof Array );
					done();
				} );
			} );
		} );

		it( 'should get subscribers post list = 1', function () {
			return new Promise( ( done ) => {
				testing_post.subscribersList( function ( err, data ) {
					if ( err ) throw err;

					assert.equal( 'number', typeof data.found );
					assert.equal( 1, data.found );
					assert.equal( 'object', typeof data.subscriptions );
					assert.ok( data.subscriptions instanceof Array );
					done();
				} );
			} );
		} );

		it( 'should get subscribers post list = 0', function () {
			return new Promise( ( done ) => {
				testing_post.subscribersList( function ( err, data ) {
					if ( err ) throw err;

					assert.equal( 'number', typeof data.found );
					assert.equal( 0, data.found );
					assert.equal( 'object', typeof data.subscriptions );
					assert.ok( data.subscriptions instanceof Array );
					done();
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.post.subscriber.mine', function () {
		it( 'should get subscribe status `FALSE` for current user', function () {
			return new Promise( ( done ) => {
				testing_post.subscriber().mine( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					assert.equal( false, data.i_subscribe );

					done();
				} );
			} );
		} );

		it( 'should get subscribe status `TRUE` for current user', function () {
			return new Promise( ( done ) => {
				testing_post.subscriber().mine( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					assert.equal( true, data.i_subscribe );
					done();
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.post.subscriber.add', function () {
		it( 'should subscribe current user to the post', function () {
			return new Promise( ( done ) => {
				testing_post.subscriber().add( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					assert.equal( true, data.success );
					assert.equal( true, data.i_subscribe );
					done();
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.post.subscriber.delete', function () {
		it( 'should unsubscribe current user from the post', function () {
			return new Promise( ( done ) => {
				testing_post.subscriber().delete( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					assert.equal( true, data.success );
					assert.equal( false, data.i_subscribe );
					done();
				} );
			} );
		} );
	} );
} );
