/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
import * as postUtils from '../utils';

jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

describe( 'utils', () => {
	describe( '#getEditURL', () => {
		test( 'should return correct path type=post is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'post' },
				{ slug: 'en.blog.wordpress.com' }
			);
			assert( url === '/post/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path type=page is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'page' },
				{ slug: 'en.blog.wordpress.com' }
			);
			assert( url === '/page/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path when custom post type is supplied', () => {
			const url = postUtils.getEditURL(
				{ ID: 123, type: 'jetpack-portfolio' },
				{ slug: 'en.blog.wordpress.com' }
			);
			assert( url === '/edit/jetpack-portfolio/en.blog.wordpress.com/123' );
		} );
	} );

	describe( '#getVisibility', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.getVisibility() === undefined );
		} );

		test( 'should return public when password and private are not set', () => {
			assert( postUtils.getVisibility( {} ) === 'public' );
		} );

		test( 'should return private when post#status is private', () => {
			assert( postUtils.getVisibility( { status: 'private' } ) === 'private' );
		} );

		test( 'should return password when post#password is set', () => {
			assert( postUtils.getVisibility( { password: 'unicorn' } ) === 'password' );
		} );
	} );

	describe( '#isPrivate', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.isPrivate() === undefined );
		} );

		test( 'should return true when post.status is private', () => {
			assert( postUtils.isPrivate( { status: 'private' } ) );
		} );

		test( 'should return false when post.status is not private', () => {
			assert( ! postUtils.isPrivate( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPublished', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.isPublished() === undefined );
		} );

		test( 'should return true when post.status is private', () => {
			assert( postUtils.isPublished( { status: 'private' } ) );
		} );

		test( 'should return true when post.status is publish', () => {
			assert( postUtils.isPublished( { status: 'publish' } ) );
		} );

		test( 'should return false when post.status is not publish or private', () => {
			assert( ! postUtils.isPublished( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPending', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.isPending() === undefined );
		} );

		test( 'should return true when post.status is pending', () => {
			assert( postUtils.isPending( { status: 'pending' } ) );
		} );

		test( 'should return false when post.status is not pending', () => {
			assert( ! postUtils.isPending( { status: 'draft' } ) );
		} );
	} );

	describe( '#isBackDatedPublished', () => {
		test( 'should return false when no post is supplied', () => {
			assert( ! postUtils.isBackDatedPublished() );
		} );

		test( 'should return false when status !== future', () => {
			assert( ! postUtils.isBackDatedPublished( { status: 'draft' } ) );
		} );

		test( 'should return false when status === future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;

			assert( ! postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) );
		} );

		test( 'should return true when status === future and date is in the past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;

			assert( postUtils.isBackDatedPublished( { status: 'future', date: postDate } ) );
		} );
	} );

	describe( '#removeSlug', () => {
		test( 'should return undefined when no path is supplied', () => {
			assert( postUtils.removeSlug() === undefined );
		} );

		test( 'should strip slug on post URL', () => {
			const noSlug = postUtils.removeSlug(
				'https://en.blog.wordpress.com/2015/08/26/new-action-bar/'
			);
			assert( noSlug === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should strip slug on page URL', () => {
			const noSlug = postUtils.removeSlug( 'https://en.blog.wordpress.com/a-test-page/' );
			assert( noSlug === 'https://en.blog.wordpress.com/' );
		} );
	} );

	describe( '#getPermalinkBasePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.getPermalinkBasePath() === undefined );
		} );

		test( 'should return post.URL when post is published', () => {
			const path = postUtils.getPermalinkBasePath( {
				status: 'publish',
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			assert( path === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = postUtils.getPermalinkBasePath( {
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			assert( path === 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getPagePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( postUtils.getPagePath() === undefined );
		} );

		test( 'should return post.URL without slug when page is published', () => {
			const path = postUtils.getPagePath( {
				status: 'publish',
				URL: 'http://zo.mg/a/permalink/',
			} );
			assert( path === 'http://zo.mg/a/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = postUtils.getPagePath( {
				status: 'draft',
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
			} );
			assert( path === 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getFeaturedImageId()', () => {
		test( 'should return undefined when no post is specified', () => {
			assert( postUtils.getFeaturedImageId() === undefined );
		} );

		test( 'should return a non-URL featured_image property', () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'media-1',
				post_thumbnail: {
					ID: 1,
				},
			} );

			assert( id === 'media-1' );
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

			assert( id === null );
		} );

		test( 'should fall back to post thumbnail object ID if exists, if featured_image is URL', () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
				post_thumbnail: {
					ID: 1,
				},
			} );

			assert( id === 1 );
		} );

		test( "should return undefined if featured_image is URL and post thumbnail object doesn't exist", () => {
			const id = postUtils.getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
			} );

			assert( id === undefined );
		} );
	} );
} );
