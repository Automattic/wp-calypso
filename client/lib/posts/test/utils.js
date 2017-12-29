/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import {
	getEditURL,
	getFeaturedImageId,
	getPagePath,
	getPermalinkBasePath,
	getVisibility,
	isBackDatedPublished,
	isPending,
	isPrivate,
	isPublished,
	removeSlug,
} from '../utils';

jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

describe( 'utils', () => {
	describe( '#getEditURL', () => {
		test( 'should return correct path type=post is supplied', () => {
			const url = getEditURL( { ID: 123, type: 'post' }, { slug: 'en.blog.wordpress.com' } );
			assert( url === '/post/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path type=page is supplied', () => {
			const url = getEditURL( { ID: 123, type: 'page' }, { slug: 'en.blog.wordpress.com' } );
			assert( url === '/page/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path when custom post type is supplied', () => {
			const url = getEditURL(
				{ ID: 123, type: 'jetpack-portfolio' },
				{ slug: 'en.blog.wordpress.com' }
			);
			assert( url === '/edit/jetpack-portfolio/en.blog.wordpress.com/123' );
		} );
	} );

	describe( '#getVisibility', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( getVisibility() === undefined );
		} );

		test( 'should return public when password and private are not set', () => {
			assert( getVisibility( {} ) === 'public' );
		} );

		test( 'should return private when post#status is private', () => {
			assert( getVisibility( { status: 'private' } ) === 'private' );
		} );

		test( 'should return password when post#password is set', () => {
			assert( getVisibility( { password: 'unicorn' } ) === 'password' );
		} );
	} );

	describe( '#isPrivate', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( isPrivate() === undefined );
		} );

		test( 'should return true when post.status is private', () => {
			assert( isPrivate( { status: 'private' } ) );
		} );

		test( 'should return false when post.status is not private', () => {
			assert( ! isPrivate( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPublished', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( isPublished() === undefined );
		} );

		test( 'should return true when post.status is private', () => {
			assert( isPublished( { status: 'private' } ) );
		} );

		test( 'should return true when post.status is publish', () => {
			assert( isPublished( { status: 'publish' } ) );
		} );

		test( 'should return false when post.status is not publish or private', () => {
			assert( ! isPublished( { status: 'draft' } ) );
		} );
	} );

	describe( '#isPending', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( isPending() === undefined );
		} );

		test( 'should return true when post.status is pending', () => {
			assert( isPending( { status: 'pending' } ) );
		} );

		test( 'should return false when post.status is not pending', () => {
			assert( ! isPending( { status: 'draft' } ) );
		} );
	} );

	describe( '#isBackDatedPublished', () => {
		test( 'should return false when no post is supplied', () => {
			assert( ! isBackDatedPublished() );
		} );

		test( 'should return false when status !== future', () => {
			assert( ! isBackDatedPublished( { status: 'draft' } ) );
		} );

		test( 'should return false when status === future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;

			assert( ! isBackDatedPublished( { status: 'future', date: postDate } ) );
		} );

		test( 'should return true when status === future and date is in the past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;

			assert( isBackDatedPublished( { status: 'future', date: postDate } ) );
		} );
	} );

	describe( '#removeSlug', () => {
		test( 'should return undefined when no path is supplied', () => {
			assert( removeSlug() === undefined );
		} );

		test( 'should strip slug on post URL', () => {
			const noSlug = removeSlug( 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/' );
			assert( noSlug === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should strip slug on page URL', () => {
			const noSlug = removeSlug( 'https://en.blog.wordpress.com/a-test-page/' );
			assert( noSlug === 'https://en.blog.wordpress.com/' );
		} );
	} );

	describe( '#getPermalinkBasePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( getPermalinkBasePath() === undefined );
		} );

		test( 'should return post.URL when post is published', () => {
			const path = getPermalinkBasePath( {
				status: 'publish',
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			assert( path === 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = getPermalinkBasePath( {
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			assert( path === 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getPagePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			assert( getPagePath() === undefined );
		} );

		test( 'should return post.URL without slug when page is published', () => {
			const path = getPagePath( {
				status: 'publish',
				URL: 'http://zo.mg/a/permalink/',
			} );
			assert( path === 'http://zo.mg/a/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = getPagePath( {
				status: 'draft',
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
			} );
			assert( path === 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getFeaturedImageId()', () => {
		test( 'should return undefined when no post is specified', () => {
			assert( getFeaturedImageId() === undefined );
		} );

		test( 'should return a non-URL featured_image property', () => {
			const id = getFeaturedImageId( {
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
			const id = getFeaturedImageId( {
				featured_image: null,
				post_thumbnail: {
					ID: 1,
				},
			} );

			assert( id === null );
		} );

		test( 'should fall back to post thumbnail object ID if exists, if featured_image is URL', () => {
			const id = getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
				post_thumbnail: {
					ID: 1,
				},
			} );

			assert( id === 1 );
		} );

		test( "should return undefined if featured_image is URL and post thumbnail object doesn't exist", () => {
			const id = getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
			} );

			assert( id === undefined );
		} );
	} );
} );
