/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import * as route from '../';
import config from 'config';

describe( 'index', function() {
	describe( 'getStreamUrlFromPost', function() {
		it( 'should return url for post from feed', function() {
			expect( route.getStreamUrlFromPost( { feed_ID: 1234 } ) ).to.equal( '/read/feeds/1234' );
		} );

		it( 'should return url for post from site', function() {
			expect( route.getStreamUrlFromPost( { site_ID: 1234 } ) ).to.equal( '/read/blogs/1234' );
		} );
	} );

	describe( 'getSiteUrl', function() {
		it( 'should return site URL', function() {
			expect( route.getSiteUrl( 1234 ) ).to.equal( '/read/blogs/1234' );
		} );

		it( 'should return pretty URL for discover', function() {
			expect( route.getSiteUrl( config( 'discover_blog_id' ) ) ).to.equal( '/discover' );
		} );
	} );

	describe( 'getFeedUrl', function() {
		it( 'should return site URL', function() {
			expect( route.getFeedUrl( 1234 ) ).to.equal( '/read/feeds/1234' );
		} );

		it( 'should return pretty URL for discover', function() {
			expect( route.getFeedUrl( config( 'discover_feed_id' ) ) ).to.equal( '/discover' );
		} );
	} );
} );
