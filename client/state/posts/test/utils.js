/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	appendToPostEditsLog,
	normalizePostForDisplay,
	normalizePostForState,
	normalizePostForApi,
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	getTermIdsFromEdits,
	isTermsEqual,
	applyPostEdits,
	mergePostEdits,
	getEditURL,
	getFeaturedImageId,
	getPermalinkBasePath,
	getVisibility,
	isBackDatedPublished,
	isPending,
	isPrivate,
	isPublished,
	removeSlug,
} from '../utils';

describe( 'utils', () => {
	describe( 'isTermsEqual', () => {
		test( 'should return false if term edits are the same as saved terms', () => {
			const isEqual = isTermsEqual(
				{
					post_tag: [ 'ribs', 'chicken' ],
					category: [
						{
							ID: 777,
							name: 'amazing food',
						},
					],
				},
				{
					post_tag: {
						ribs: {
							ID: 11,
							name: 'ribs',
						},
						chicken: {
							ID: 12,
							name: 'chicken',
						},
					},
					category: {
						'amazing-food': {
							ID: 777,
							name: 'amazing food',
						},
					},
				}
			);
			expect( isEqual ).toBe( true );
		} );

		test( 'should return false if term edits are not the same as saved terms', () => {
			const isEqual = isTermsEqual(
				{
					post_tag: [ 'ribs' ],
					category: [
						{
							ID: 777,
							name: 'amazing food',
						},
					],
				},
				{
					post_tag: {
						ribs: {
							ID: 11,
							name: 'ribs',
						},
						chicken: {
							ID: 12,
							name: 'chicken',
						},
					},
					category: {
						'amazing-food': {
							ID: 777,
							name: 'amazing food',
						},
					},
				}
			);
			expect( isEqual ).toBe( false );
		} );

		test( 'should return false savedTerms is missing a taxonomy', () => {
			const isEqual = isTermsEqual(
				{
					post_tag: [ 'ribs' ],
				},
				{}
			);
			expect( isEqual ).toBe( false );
		} );
	} );

	describe( 'normalizePostForApi()', () => {
		test( 'should return null if post is falsey', () => {
			const normalizedPost = normalizePostForApi();
			expect( normalizedPost ).toBeNull();
		} );

		test( 'should return a normalized post object', () => {
			const post = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					category: [ { ID: 777, name: 'recipes' } ],
					post_tag: [ 'super', 'yummy', 'stuff' ],
				},
			};

			const normalizedPost = normalizePostForApi( post );
			expect( normalizedPost ).toEqual( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					post_tag: [ 'super', 'yummy', 'stuff' ],
				},
			} );
		} );
	} );

	describe( 'normalizePostForDisplay()', () => {
		test( 'should return null if post is falsey', () => {
			const normalizedPost = normalizePostForDisplay();
			expect( normalizedPost ).toBeNull();
		} );

		test( 'should return a normalized post object', () => {
			const post = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				author: {
					name: 'Badman <img onerror= />',
				},
				post_thumbnail: {
					URL: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				},
			};

			const normalizedPost = normalizePostForDisplay( post );
			expect( normalizedPost ).toEqual( {
				...post,
				title: 'Ribs & Chicken',
				author: {
					name: 'Badman ',
				},
				canonical_image: {
					uri: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				},
			} );
		} );
	} );

	describe( 'normalizePostForState()', () => {
		test( 'should deeply unset all meta links', () => {
			const original = deepFreeze( {
				ID: 814,
				meta: {
					links: {},
					data: { autosave: true },
				},
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {
								links: {},
							},
						},
					},
					post_tag: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {
								links: {},
							},
						},
					},
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {
							links: {},
						},
					},
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {
							links: {},
						},
					},
				},
				attachments: {
					14209: {
						ID: 14209,
						meta: {
							links: {},
						},
					},
				},
			} );
			const revised = normalizePostForState( original );

			expect( revised ).not.toEqual( original );
			expect( revised ).toEqual( {
				ID: 814,
				meta: {
					data: { autosave: true },
				},
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {},
						},
					},
					post_tag: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {},
						},
					},
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {},
					},
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {},
					},
				},
				attachments: {
					14209: {
						ID: 14209,
						meta: {},
					},
				},
			} );
		} );
	} );

	describe( '#getNormalizedPostsQuery()', () => {
		test( 'should exclude default values', () => {
			const query = getNormalizedPostsQuery( {
				page: 4,
				number: 20,
			} );

			expect( query ).toEqual( {
				page: 4,
			} );
		} );
	} );

	describe( '#getSerializedPostsQuery()', () => {
		test( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedPostsQuery( {
				type: 'page',
				page: 1,
			} );

			expect( serializedQuery ).toBe( '{"type":"page"}' );
		} );

		test( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQuery(
				{
					search: 'Hello',
				},
				2916284
			);

			expect( serializedQuery ).toBe( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedPostsQueryDetails()', () => {
		test( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( 'bad' );

			expect( queryDetails ).toEqual( {
				siteId: undefined,
				query: undefined,
			} );
		} );

		test( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).toEqual( {
				siteId: undefined,
				query: { search: 'hello' },
			} );
		} );

		test( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).toEqual( {
				siteId: 2916284,
				query: { search: 'hello' },
			} );
		} );
	} );

	describe( '#getSerializedPostsQueryWithoutPage()', () => {
		test( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				type: 'page',
				page: 2,
			} );

			expect( serializedQuery ).toBe( '{"type":"page"}' );
		} );

		test( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage(
				{
					search: 'Hello',
					page: 2,
				},
				2916284
			);

			expect( serializedQuery ).toBe( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'appendToPostEditsLog', () => {
		test( 'should create a new log when input log is empty', () => {
			const newLog = appendToPostEditsLog( null, { title: 'Hello' } );
			expect( newLog ).toEqual( [ { title: 'Hello' } ] );
		} );

		test( 'should append edit to an empty log', () => {
			const newLog = appendToPostEditsLog( [], { title: 'Hello' } );
			expect( newLog ).toEqual( [ { title: 'Hello' } ] );
		} );

		test( 'should merge with last edit if it is not a save marker', () => {
			const newLog = appendToPostEditsLog( [ { title: 'Hello' } ], { content: 'World' } );
			expect( newLog ).toEqual( [ { title: 'Hello', content: 'World' } ] );
		} );

		test( 'should append a new edit if the last one is a save marker', () => {
			const newLog = appendToPostEditsLog( [ { title: 'Hello' }, 'marker' ], { content: 'World' } );
			expect( newLog ).toEqual( [ { title: 'Hello' }, 'marker', { content: 'World' } ] );
		} );
	} );

	describe( 'mergePostEdits', () => {
		test( 'should return null when there are no objects to merge', () => {
			expect( mergePostEdits() ).toBeNull();
		} );

		test( 'should return null when there are no objects to merge, only markers', () => {
			expect( mergePostEdits( 'marker' ) ).toBeNull();
		} );

		test( 'should return identical object when called with only one object', () => {
			const postEdit = deepFreeze( { title: 'Hello' } );
			const merged = mergePostEdits( postEdit );
			expect( merged ).toBe( postEdit );
		} );

		test( 'should return identical object when called with only one object + markers', () => {
			const postEdit = deepFreeze( { title: 'Hello' } );
			const merged = mergePostEdits( 'marker1', postEdit, 'marker2' );
			expect( merged ).toBe( postEdit );
		} );

		test( 'should merge multiple objects', () => {
			const merged = mergePostEdits(
				deepFreeze( { title: 'Hello' } ),
				deepFreeze( { content: 'World' } ),
				deepFreeze( { excerpt: 'Hi' } )
			);

			expect( merged ).toEqual( {
				title: 'Hello',
				content: 'World',
				excerpt: 'Hi',
			} );
		} );

		test( 'should merge multiple objects with interlaced markers', () => {
			const merged = mergePostEdits(
				deepFreeze( { title: 'Hello' } ),
				'marker1',
				deepFreeze( { content: 'World' } ),
				'marker2',
				deepFreeze( { excerpt: 'Hi' } )
			);

			expect( merged ).toEqual( {
				title: 'Hello',
				content: 'World',
				excerpt: 'Hi',
			} );
		} );

		test( 'should merge into an empty object', () => {
			const merged = mergePostEdits( deepFreeze( {} ), {
				tags_by_id: [ 4, 5, 6 ],
			} );

			expect( merged ).toEqual( {
				tags_by_id: [ 4, 5, 6 ],
			} );
		} );

		test( 'should not modify array properties in the original object', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					tags_by_id: [ 4, 5, 6 ],
				} ),
				{}
			);

			expect( merged ).toEqual( {
				tags_by_id: [ 4, 5, 6 ],
			} );
		} );

		test( 'should allow removing array items', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					tags_by_id: [ 4, 5, 6 ],
				} ),
				{
					tags_by_id: [ 4, 6 ],
				}
			);

			expect( merged ).toEqual( {
				tags_by_id: [ 4, 6 ],
			} );
		} );

		test( 'should replace arrays with the new value', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					tags_by_id: [ 4, 5, 6 ],
				} ),
				{
					tags_by_id: [ 1, 2, 3, 4 ],
				}
			);

			expect( merged ).toEqual( {
				tags_by_id: [ 1, 2, 3, 4 ],
			} );
		} );

		test( 'should add properties to nested objects', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					discussion: { comments_open: false },
				} ),
				{
					discussion: { pings_open: false },
				}
			);

			expect( merged ).toEqual( {
				discussion: { comments_open: false, pings_open: false },
			} );
		} );

		test( 'should replace previous metadata edit', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					metadata: [ { key: 'geo_latitude', operation: 'delete' } ],
				} ),
				{
					metadata: [ { key: 'geo_latitude', value: '20', operation: 'update' } ],
				}
			);

			expect( merged ).toEqual( {
				metadata: [ { key: 'geo_latitude', value: '20', operation: 'update' } ],
			} );
		} );

		test( 'should add new metadata edit', () => {
			const merged = mergePostEdits(
				deepFreeze( {
					metadata: [ { key: 'geo_latitude', value: '10', operation: 'update' } ],
				} ),
				{
					metadata: [ { key: 'geo_longitude', value: '20', operation: 'update' } ],
				}
			);

			expect( merged ).toEqual( {
				metadata: [
					{ key: 'geo_latitude', value: '10', operation: 'update' },
					{ key: 'geo_longitude', value: '20', operation: 'update' },
				],
			} );
		} );
	} );

	describe( 'applyPostEdits', () => {
		test( 'should modify metadata', () => {
			const edited = applyPostEdits(
				deepFreeze( {
					metadata: [ { key: 'geo_latitude', value: '10' } ],
				} ),
				{
					metadata: [ { key: 'geo_latitude', value: '20', operation: 'update' } ],
				}
			);

			expect( edited ).toEqual( {
				metadata: [ { key: 'geo_latitude', value: '20' } ],
			} );
		} );

		test( 'should add metadata', () => {
			const edited = applyPostEdits(
				deepFreeze( {
					metadata: [ { key: 'geo_latitude', value: '10' } ],
				} ),
				{
					metadata: [ { key: 'geo_longitude', value: '20', operation: 'update' } ],
				}
			);

			expect( edited ).toEqual( {
				metadata: [
					{ key: 'geo_latitude', value: '10' },
					{ key: 'geo_longitude', value: '20' },
				],
			} );
		} );

		test( 'should remove metadata', () => {
			const edited = applyPostEdits(
				deepFreeze( {
					metadata: [
						{ key: 'geo_latitude', value: '10' },
						{ key: 'geo_longitude', value: '20' },
					],
				} ),
				{
					metadata: [ { key: 'geo_longitude', operation: 'delete' } ],
				}
			);

			expect( edited ).toEqual( {
				metadata: [ { key: 'geo_latitude', value: '10' } ],
			} );
		} );

		test( 'should return unchanged object on noop update', () => {
			const post = deepFreeze( {
				metadata: [ { key: 'geo_latitude', value: '10' } ],
			} );

			const edited = applyPostEdits( post, {
				metadata: [ { key: 'geo_latitude', value: '10', operation: 'update' } ],
			} );

			expect( edited ).toEqual( post );
		} );

		test( 'should return unchanged object on noop delete', () => {
			const post = deepFreeze( {
				metadata: [ { key: 'geo_latitude', value: '10' } ],
			} );

			const edited = applyPostEdits( post, {
				metadata: [ { key: 'geo_longitude', value: '10', operation: 'delete' } ],
			} );

			expect( edited ).toEqual( post );
		} );

		test( 'should return metadata array after applying edits to a false value', () => {
			const post = deepFreeze( {
				metadata: false, // value returned by REST API for a new post
			} );

			const edited = applyPostEdits( post, {
				metadata: [ { key: 'geo_latitude', value: '10', operation: 'update' } ],
			} );

			expect( edited ).toEqual( {
				metadata: [ { key: 'geo_latitude', value: '10' } ],
			} );
		} );
	} );

	describe( '#getTermIdsFromEdits()', () => {
		test( 'should return the same post edit object if no term edits have been made', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
			} );

			expect( normalizedPostEdits ).toEqual( {
				title: 'Chewbacca Saves',
			} );
		} );

		test( 'should return the add terms_by_id if terms have been edited', () => {
			const originalPost = deepFreeze( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce',
						},
					},
				},
			} );

			const normalizedPostEdits = getTermIdsFromEdits( originalPost );

			expect( normalizedPostEdits ).toEqual( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce',
						},
					},
				},
				terms_by_id: {
					wookie_post_types: [ 777 ],
				},
			} );
		} );

		test( 'should taxonomy terms_by_id to null if object is empty', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {},
				},
			} );

			expect( normalizedPostEdits ).toEqual( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_types: {},
				},
				terms_by_id: {
					wookie_post_types: null,
				},
			} );
		} );

		test( 'should not set terms_by_id for taxonomies that set an array on terms', () => {
			const normalizedPostEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_tags: [ 'raaar', 'uggggaaarr' ],
				},
			} );

			expect( normalizedPostEdits ).toEqual( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_post_tags: [ 'raaar', 'uggggaaarr' ],
				},
			} );
		} );
	} );

	describe( '#getEditURL', () => {
		test( 'should return correct path type=post is supplied', () => {
			const url = getEditURL( { ID: 123, type: 'post' }, { slug: 'en.blog.wordpress.com' } );
			expect( url ).toEqual( '/post/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path type=page is supplied', () => {
			const url = getEditURL( { ID: 123, type: 'page' }, { slug: 'en.blog.wordpress.com' } );
			expect( url ).toEqual( '/page/en.blog.wordpress.com/123' );
		} );

		test( 'should return correct path when custom post type is supplied', () => {
			const url = getEditURL(
				{ ID: 123, type: 'jetpack-portfolio' },
				{ slug: 'en.blog.wordpress.com' }
			);
			expect( url ).toEqual( '/edit/jetpack-portfolio/en.blog.wordpress.com/123' );
		} );

		test( 'should default to type=post if no post type is supplied', () => {
			const url = getEditURL( { ID: 123, type: '' }, { slug: 'en.blog.wordpress.com' } );
			expect( url ).toEqual( '/post/en.blog.wordpress.com/123' );
		} );
	} );

	describe( '#getVisibility', () => {
		test( 'should return null when no post is supplied', () => {
			expect( getVisibility() ).toBeNull();
		} );

		test( 'should return public when password and private are not set', () => {
			expect( getVisibility( {} ) ).toEqual( 'public' );
		} );

		test( 'should return private when post#status is private', () => {
			expect( getVisibility( { status: 'private' } ) ).toEqual( 'private' );
		} );

		test( 'should return password when post#password is set', () => {
			expect( getVisibility( { password: 'unicorn' } ) ).toEqual( 'password' );
		} );
	} );

	describe( '#isPrivate', () => {
		test( 'should return false when no post is supplied', () => {
			expect( isPrivate() ).toBe( false );
		} );

		test( 'should return true when post.status is private', () => {
			expect( isPrivate( { status: 'private' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not private', () => {
			expect( isPrivate( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isPublished', () => {
		test( 'should return false when no post is supplied', () => {
			expect( isPublished() ).toBe( false );
		} );

		test( 'should return true when post.status is private', () => {
			expect( isPublished( { status: 'private' } ) ).toBe( true );
		} );

		test( 'should return true when post.status is publish', () => {
			expect( isPublished( { status: 'publish' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not publish or private', () => {
			expect( isPublished( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isPending', () => {
		test( 'should return false when no post is supplied', () => {
			expect( isPending() ).toBe( false );
		} );

		test( 'should return true when post.status is pending', () => {
			expect( isPending( { status: 'pending' } ) ).toBe( true );
		} );

		test( 'should return false when post.status is not pending', () => {
			expect( isPending( { status: 'draft' } ) ).toBe( false );
		} );
	} );

	describe( '#isBackDatedPublished', () => {
		test( 'should return false when no post is supplied', () => {
			expect( isBackDatedPublished() ).toBe( false );
		} );

		test( 'should return false when status !== future', () => {
			expect( isBackDatedPublished( { status: 'draft' } ) ).toBe( false );
		} );

		test( 'should return false when status === future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;

			expect( isBackDatedPublished( { status: 'future', date: postDate } ) ).toBe( false );
		} );

		test( 'should return true when status === future and date is in the past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;

			expect( isBackDatedPublished( { status: 'future', date: postDate } ) ).toBe( true );
		} );
	} );

	describe( '#removeSlug', () => {
		test( 'should return undefined when no path is supplied', () => {
			expect( removeSlug() ).toBeUndefined();
		} );

		test( 'should strip slug on post URL', () => {
			const noSlug = removeSlug( 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/' );
			expect( noSlug ).toEqual( 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should strip slug on page URL', () => {
			const noSlug = removeSlug( 'https://en.blog.wordpress.com/a-test-page/' );
			expect( noSlug ).toEqual( 'https://en.blog.wordpress.com/' );
		} );
	} );

	describe( '#getPermalinkBasePath', () => {
		test( 'should return undefined when no post is supplied', () => {
			expect( getPermalinkBasePath() ).toBeUndefined();
		} );

		test( 'should return post.URL when post is published', () => {
			const path = getPermalinkBasePath( {
				status: 'publish',
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			expect( path ).toEqual( 'https://en.blog.wordpress.com/2015/08/26/' );
		} );

		test( 'should use permalink_URL when not published and present', () => {
			const path = getPermalinkBasePath( {
				other_URLs: { permalink_URL: 'http://zo.mg/a/permalink/%post_name%/' },
				URL: 'https://en.blog.wordpress.com/2015/08/26/new-action-bar/',
			} );
			expect( path ).toEqual( 'http://zo.mg/a/permalink/' );
		} );
	} );

	describe( '#getFeaturedImageId()', () => {
		test( 'should return undefined when no post is specified', () => {
			expect( getFeaturedImageId() ).toBeUndefined();
		} );

		test( 'should return a non-URL featured_image property', () => {
			const id = getFeaturedImageId( {
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
			const id = getFeaturedImageId( {
				featured_image: null,
				post_thumbnail: {
					ID: 1,
				},
			} );

			expect( id ).toBeNull();
		} );

		test( 'should return empty string if that is the featured_image value', () => {
			// These values are typical for posts without a featured image
			const id = getFeaturedImageId( {
				featured_image: '',
				post_thumbnail: null,
			} );

			expect( id ).toEqual( '' );
		} );

		test( 'should fall back to post thumbnail object ID if exists, if featured_image is URL', () => {
			const id = getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
				post_thumbnail: {
					ID: 1,
				},
			} );

			expect( id ).toEqual( 1 );
		} );

		test( "should return undefined if featured_image is URL and post thumbnail object doesn't exist", () => {
			const id = getFeaturedImageId( {
				featured_image: 'https://example.com/image.png',
			} );

			expect( id ).toBeUndefined();
		} );
	} );
} );
