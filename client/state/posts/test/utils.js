import deepFreeze from 'deep-freeze';
import {
	normalizePostForDisplay,
	normalizePostForState,
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	isTermsEqual,
	mergePostEdits,
	getEditURL,
	getFeaturedImageId,
	getUnappliedMetadataEdits,
} from '../utils';

describe( 'utils', () => {
	describe( 'isTermsEqual', () => {
		test( 'should return true if term edits are the same as saved terms', () => {
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

	describe( '#getUnappliedMetadataEdits()', () => {
		const edits = [
			{ key: 'geo_latitude', value: '10', operation: 'update' },
			{ key: 'geo_longitude', operation: 'delete' },
		];

		test( 'should treat false saved metadata as empty (REST shape for a new post)', () => {
			// The REST API returns `false` for a new post's metadata.
			expect( getUnappliedMetadataEdits( edits, false ) ).toEqual( [
				{ key: 'geo_latitude', value: '10', operation: 'update' },
			] );
		} );

		test( 'should drop edits already reflected in saved metadata', () => {
			const savedMetadata = [ { key: 'geo_latitude', value: '10' } ];
			expect( getUnappliedMetadataEdits( edits, savedMetadata ) ).toEqual( [] );
		} );
	} );
} );
