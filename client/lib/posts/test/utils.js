/**
 * External dependencies
 */
var assert = require( 'better-assert' );

/**
* Internal dependencies
*/
var postUtils = require( '../utils' );

describe( 'PostUtils', function() {
	describe( '#getVisibility', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.getVisibility() === undefined );
		} );

		it( 'should return public when password and private are not set', function() {
			assert( postUtils.getVisibility( {} ) === 'public' );
		} );

		it( 'should return private when post#status is private', function() {
			assert( postUtils.getVisibility( { status: 'private' } ) === 'private' );
		} );

		it( 'should return password when post#password is set', function() {
			assert( postUtils.getVisibility( { password: 'unicorn' } ) === 'password' );
		} );
	} );

	describe( '#removeSlug', function() {
		it( 'should return undefined when no path is supplied', function() {
			assert( postUtils.removeSlug() === undefined );
		} );

		it( 'should strip slug on post URL', function() {
			var noSlug = postUtils.removeSlug( 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/' );
			assert( noSlug === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		it( 'should strip slug on page URL', function() {
			var noSlug = postUtils.removeSlug( 'https://en.blog.wordpress.com/a-test-page/' );
			assert( noSlug === 'https://en.blog.wordpress.com/' );
		} );
	} );

	describe( '#getPermalinkBasePath', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.getPermalinkBasePath() === undefined );
		} );

		it( 'should return post.URL when post is published', function() {
			var path = postUtils.getPermalinkBasePath( { status: 'publish', URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/' } );
			assert( path === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		it( 'should use permalink_URL when not published and present', function() {
			var path = postUtils.getPermalinkBasePath( { other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' }, URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/' } );
			assert( path === 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getFeaturedImageId()', function() {
		it( 'should return undefined when no post is specified', function() {
			assert( postUtils.getFeaturedImageId() === undefined );
		} );

		it( 'should return a non-URL featured_image property', function() {
			var id = postUtils.getFeaturedImageId( {
				featured_image: 'media-1',
				post_thumbnail: {
					ID: 1
				}
			} );

			assert( id === 'media-1' );
		} );

		it( 'should return a `null` featured_image property', function() {
			// This describes the behavior of unassigning a featured image
			// from the current post
			var id = postUtils.getFeaturedImageId( {
				featured_image: null,
				post_thumbnail: {
					ID: 1
				}
			} );

			assert( id === null );
		} );

		it( 'should fall back to post thumbnail object ID if exists, if featured_image is URL', function() {
			var id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
				post_thumbnail: {
					ID: 1
				}
			} );

			assert( id === 1 );
		} );

		it( 'should return undefined if featured_image is URL and post thumbnail object doesn\'t exist', function() {
			var id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png'
			} );

			assert( id === undefined );
		} );
	} );
} );
