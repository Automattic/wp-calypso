/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.follow
 */
describe.skip( 'wpcom.site.follow', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var follow = site.follow();

	describe( 'wpcom.site.follow.follow', function () {
		it( 'should follow site', ( done ) => {
			follow
				.follow()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( true, data.is_following );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.follow.unfollow', function () {
		it( 'should unfollow site', ( done ) => {
			follow
				.unfollow()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( false, data.is_following );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.follow.mine', function () {
		it( 'should get follow status', ( done ) => {
			follow
				.mine()
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( false, data.is_following );

					done();
				} )
				.catch( done );
		} );
	} );
} );
