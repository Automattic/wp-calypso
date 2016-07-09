/**
 * External dependencies
 */
import assert from 'assert';

/**
* Internal dependencies
*/
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'utils', function() {
	let postUtils;

	useFakeDom();

	before( () => {
		postUtils = require( '../utils' );
	} );

	describe( '#getEditURL', function() {
		it( 'should return correct path type=post is supplied', function() {
			const url = postUtils.getEditURL( { ID: 123, type: 'post' }, { slug: 'en.blog.wordpress.com' } );
			assert( url === '/post/en.blog.wordpress.com/123' );
		} );

		it( 'should return correct path type=page is supplied', function() {
			const url = postUtils.getEditURL( { ID: 123, type: 'page' }, { slug: 'en.blog.wordpress.com' } );
			assert( url === '/page/en.blog.wordpress.com/123' );
		} );

		it( 'should return correct path when custom post type is supplied', function() {
			const url = postUtils.getEditURL( { ID: 123, type: 'jetpack-portfolio' }, { slug: 'en.blog.wordpress.com' } );
			assert( url === '/edit/jetpack-portfolio/en.blog.wordpress.com/123' );
		} );
	} );

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

	describe( '#isPrivate', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.isPrivate() === undefined );
		} );

		it( 'should return true when post.status is private', function() {
			assert( postUtils.isPrivate( { status: 'private' } ) );
		} );

		it( 'should return false when post.status is not private', function() {
			assert( ! postUtils.isPrivate( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPublished', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.isPublished() === undefined );
		} );

		it( 'should return true when post.status is private', function() {
			assert( postUtils.isPublished( { status: 'private' } ) );
		} );

		it( 'should return true when post.status is publish', function() {
			assert( postUtils.isPublished( { status: 'publish' } ) );
		} );

		it( 'should return false when post.status is not publish or private', function() {
			assert( ! postUtils.isPublished( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPending', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.isPending() === undefined );
		} );

		it( 'should return true when post.status is pending', function() {
			assert( postUtils.isPending( { status: 'pending' } ) );
		} );

		it( 'should return false when post.status is not pending', function() {
			assert( ! postUtils.isPending( { status: 'draft' } ) );
		} );
	} );

	describe( '#isBackDatedPublished', function() {
		it( 'should return false when no post is supplied', function() {
			assert( ! postUtils.isBackDatedPublished() );
		} );

		it( 'should return false when status !== future', function() {
			assert( ! postUtils.isBackDatedPublished( { status: 'draft' } ) );
		} );

		it( 'should return false when status === future and date is in future', function() {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;

			assert( ! postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) );
		} );

		it( 'should return true when status === future and date is in the past', function() {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;

			assert( postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) );
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

	describe( '#getPagePath', function() {
		it( 'should return undefined when no post is supplied', function() {
			assert( postUtils.getPagePath() === undefined );
		} );

		it( 'should return post.URL without slug when page is published', function() {
			var path = postUtils.getPagePath( { status: 'publish', URL: 'http://zo.mg/a/permalink/' } );
			assert( path === 'http://zo.mg/a/' );
		} );

		it( 'should use permalink_URL when not published and present', function() {
			var path = postUtils.getPagePath( { status: 'draft', other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' } } );
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
