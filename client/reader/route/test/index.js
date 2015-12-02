/**
 * External dependencies
 */
var expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var route = require( '../' );

describe( 'reader/route', function() {
	describe( 'getStreamUrlFromPost', function() {
		it( 'should return url for post from feed', function() {
			expect( route.getStreamUrlFromPost( { feed_ID: 1234 } ) ).to.equal( '/read/blog/feed/1234' );
		} );

		it( 'should return url for post from site', function() {
			expect( route.getStreamUrlFromPost( { site_ID: 1234 } ) ).to.equal( '/read/blog/id/1234' );
		} );
	} );

	describe( 'getSiteUrl', function() {
		it( 'should return site URL', function() {
			expect( route.getSiteUrl( 1234 ) ).to.equal( '/read/blog/id/1234' );
		} );

		it( 'should return pretty URL for discover', function() {
			expect( route.getSiteUrl( 53424024 ) ).to.equal( '/discover' );
		} );
	} );

	describe( 'getFeedUrl', function() {
		it( 'should return site URL', function() {
			expect( route.getFeedUrl( 1234 ) ).to.equal( '/read/blog/feed/1234' );
		} );

		it( 'should return pretty URL for discover', function() {
			expect( route.getFeedUrl( 12733228 ) ).to.equal( '/discover' );
		} );
	} );
} );
