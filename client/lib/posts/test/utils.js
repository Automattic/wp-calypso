/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import * as postUtils from '../utils';

describe( 'utils', () => {
	describe( '#getEditURL', () => {
		test( 'should return correct path type=post is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'post' },
				{ slug: 'en.blog.wordpress.com' }
			);
			expect( url ).toEqual( '/post/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path type=page is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'page' },
				{ slug: 'en.blog.wordpress.com' }
			);
			expect( url ).toEqual( '/page/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path when custom post type is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'jetpack-portfolio' },
				{ slug: 'en.blog.wordpress.com' }
			);
			expect( url ).toEqual( '/edit/jetpack-portfolio/en.blog.wordpress.com/123' );
		} );

		test( 'should default to type=post if no post type is supplied', () => {
			const url = postUtils.getEditURL( { ID: 123, type: '' }, { slug: 'en.blog.wordpress.com' } );
			expect( url ).toEqual( '/post/en.blog.wordpress.com/123' );
		} );
	} );

	describe( '#getVisibility', () => {
		test( 'should return null when no post is supplied', () => {
			expect( postUtils.getVisibility() ).toBeNull();
		} );

		test( 'should return public when password and private are not set', () => {
			expect( postUtils.getVisibility( {} ) ).toEqual( 'public' );
		} );

		test( 'should return private when post#status is private', () => {
			expect( postUtils.getVisibility( { status: 'private' } ) ).toEqual( 'private' );
		} );

		test( 'should return password when post#password is set', () => {
			expect( postUtils.getVisibility( { password: 'unicorn' } ) ).toEqual( 'password' );
		} );
	} );

	describe( '#isPrivate', () => {
		test( 'should return false when no post is supplied', () => {
			expect( postUtils.isPrivate() ).toBe( false );
		} );

		test( 'should return true when post.status is private', () => {
			expect( postUtils.isPrivate( { status: 'private' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not private', () => {
			expect( postUtils.isPrivate( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isPublished', () => {
		test( 'should return false when no post is supplied', () => {
			expect( postUtils.isPublished() ).toBe( false );
		} );

		test( 'should return true when post.status is private', () => {
			expect( postUtils.isPublished( { status: 'private' } ) ).toBe( true );
		} );

		test( 'should return true when post.status is publish', () => {
			expect( postUtils.isPublished( { status: 'publish' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not publish or private', () => {
			expect( postUtils.isPublished( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isPending', () => {
		test( 'should return false when no post is supplied', () => {
			expect( postUtils.isPending() ).toBe( false );
		} );

		test( 'should return true when post.status is pending', () => {
			expect( postUtils.isPending( { status: 'pending' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not pending', () => {
			expect( postUtils.isPending( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isBackDatedPublished', () => {
		test( 'should return false when no post is supplied', () => {
			expect( postUtils.isBackDatedPublished() ).toBe( false );
		} );

		test( 'should return false when status !== future', () => {
			expect( postUtils.isBackDatedPublished( { status: 'draft' } ) ).toBe( false );
		} );

		test( 'should return false when status === future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;

			expect( postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) ).toBe(
				false
			);
		} );

		test( 'should return true when status === future and date is in the past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;

			expect( postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) ).toBe( true );
		} );
	} );

	describe( '#removeSlug', () => {
		test( 'should return undefined when no path is supplied', () => {
			expect( postUtils.removeSlug() ).toBeUndefined();
		} );

		test( 'should strip slug on post URL', () => {
			const noSlug = postUtils.removeSlug(
				'https://en.blog.wordpress.com/2015/08/26/new-action-bar/'
			);
			expect( noSlug ).toEqual( 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should strip slug on page URL', () => {
			const noSlug = postUtils.removeSlug( 'https://en.blog.wordpress.com/a-test-page/' );
			expect( noSlug ).toEqual( 'https://en.blog.wordpress.com/' );
		} );
	} );

	describe( '#getPermalinkBasePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			expect( postUtils.getPermalinkBasePath() ).toBeUndefined();
		} );

		test( 'should return post.URL when post is published', () => {
			const path = postUtils.getPermalinkBasePath( {
				status: 'publish',
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			expect( path ).toEqual( 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = postUtils.getPermalinkBasePath( {
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			expect( path ).toEqual( 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getPagePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			expect( postUtils.getPagePath() ).toBeUndefined();
		} );

		test( 'should return post.URL without slug when page is published', () => {
			const path = postUtils.getPagePath( {
				status: 'publish',
				URL: 'http://zo.mg/a/permalink/',
			} );
			expect( path ).toEqual( 'http://zo.mg/a/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = postUtils.getPagePath( {
				status: 'draft',
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
			} );
			expect( path ).toEqual( 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getFeaturedImageId()', () => {
		test( 'should return undefined when no post is specified', () => {
			expect( postUtils.getFeaturedImageId() ).toBeUndefined();
		} );

		test( 'should return a non-URL featured_image property', () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'media-1',
				post_thumbnail: {
					ID: 1,
				},
			} );

			expect( id ).toEqual( 'media-1' );
		} );

		test( 'should return a `null` featured_image property', () => {
			// This describes the behavior of unassigning a featured image
			// from the current post
			const id = postUtils.getFeaturedImageId( {
				featured_image: null,
				post_thumbnail: {
					ID: 1,
				},
			} );

			expect( id ).toBeNull();
		} );

		test( 'should return empty string if that is the featured_image value', () => {
			// These values are typical for posts without a featured image
			const id = postUtils.getFeaturedImageId( {
				featured_image: '',
				post_thumbnail: null,
			} );

			expect( id ).toEqual( '' );
		} );

		test( 'should fall back to post thumbnail object ID if exists, if featured_image is URL', () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
				post_thumbnail: {
					ID: 1,
				},
			} );

			expect( id ).toEqual( 1 );
		} );

		test( "should return undefined if featured_image is URL and post thumbnail object doesn't exist", () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
			} );

			expect( id ).toBeUndefined();
		} );
	} );
} );
