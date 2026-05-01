import deepfreeze from 'deep-freeze';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { READER_STREAMS_PAGE_REQUEST } from 'calypso/state/reader/action-types';
import { receivePage, receiveUpdates } from 'calypso/state/reader/streams/actions';
import { requestPage, handlePage, INITIAL_FETCH, QUERY_META } from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp' );
jest.mock( 'calypso/reader/stats', () => ( { recordTrack: () => {} } ) );
jest.mock( '@wordpress/warning', () => () => {} );

// `requestPage` in `state/reader/streams/actions` is a thunk; it dispatches the
// action below for unmigrated streams. Build the action shape directly here so
// these legacy data-layer tests don't depend on the thunk's runtime.
function makeAction( { streamKey, ...overrides } ) {
	const colon = streamKey.indexOf( ':' );
	const streamType = colon === -1 ? streamKey : streamKey.substring( 0, colon );
	return deepfreeze( {
		type: READER_STREAMS_PAGE_REQUEST,
		payload: {
			streamKey,
			streamType,
			pageHandle: undefined,
			isPoll: false,
			gap: null,
			localeSlug: null,
			feedId: undefined,
			...overrides,
		},
	} );
}

describe( 'streams', () => {
	// `following` is migrated to React Query (see
	// client/state/reader/streams/test/actions.js). Use a still-unmigrated
	// stream type for the shared `handlePage` action below.
	const action = makeAction( { streamKey: 'site:1234' } );

	describe( 'requestPage', () => {
		const query = {
			orderBy: 'date',
			meta: QUERY_META,
			number: INITIAL_FETCH,
			content_width: 675,
			lang: 'en',
		};

		it.each( [
			'following',
			'discover:recommended',
			'discover:recommended--wordpress--blogging',
			'discover:latest',
			'discover:latest--wordpress',
			'discover:tags',
			'discover:dailyprompt',
			'discover:freshly-pressed',
		] )( 'returns undefined for migrated streamKey %s', ( streamKey ) => {
			expect( requestPage( makeAction( { streamKey } ) ) ).toBeUndefined();
		} );

		describe( 'stream types', () => {
			// a bunch of test cases
			// each test is an assertion of the http call that should be made
			// when the given stream id is handed to request page
			[
				{
					stream: 'a8c',
					expected: {
						method: 'GET',
						path: '/read/a8c',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'p2',
					expected: {
						method: 'GET',
						path: '/read/following/p2',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'conversations',
					expected: {
						method: 'GET',
						path: '/read/conversations',
						apiVersion: '1.2',
						query: { ...query, comments_per_post: 20 },
					},
				},
				{
					stream: 'conversations-a8c',
					expected: {
						method: 'GET',
						path: '/read/conversations',
						apiVersion: '1.2',
						query: { ...query, comments_per_post: 20, index: 'a8c' },
					},
				},
				{
					stream: 'search: { "q": "foo", "sort": "date" }',
					expected: {
						method: 'GET',
						path: '/read/search',
						apiVersion: '1.2',
						query: {
							sort: 'date',
							q: 'foo',
							lang: 'en',
							number: INITIAL_FETCH,
							content_width: 675,
						},
					},
				},
				{
					stream: 'search: { "q": "foo:bar", "sort": "relevance" }',
					expected: {
						method: 'GET',
						path: '/read/search',
						apiVersion: '1.2',
						query: {
							sort: 'relevance',
							q: 'foo:bar',
							lang: 'en',
							number: INITIAL_FETCH,
							content_width: 675,
						},
					},
				},
				{
					stream: 'feed:1234',
					expected: {
						method: 'GET',
						path: '/read/feed/1234/posts',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'site:1234',
					expected: {
						method: 'GET',
						path: '/read/sites/1234/posts',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'featured:1234',
					expected: {
						method: 'GET',
						path: '/read/sites/1234/featured',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'likes',
					expected: {
						method: 'GET',
						path: '/read/liked',
						apiVersion: '1.2',
						query,
					},
				},
				{
					stream: 'recommendations_posts',
					expected: {
						method: 'GET',
						path: '/read/recommendations/posts',
						apiVersion: '1.2',
						query: {
							algorithm: 'read:recommendations:posts/es/1',
							seed: expect.any( Number ),
						},
					},
				},
				{
					stream: 'custom_recs_posts_with_images',
					expected: {
						method: 'GET',
						path: '/read/recommendations/posts',
						apiVersion: '1.2',
						query: {
							...query,
							alg_prefix: 'read:recommendations:posts',
							seed: expect.any( Number ),
						},
					},
				},
			].forEach( ( testCase ) => {
				it( testCase.stream + ' should pass the expected params', () => {
					const pageAction = makeAction( { streamKey: testCase.stream } );
					const expected = {
						onSuccess: pageAction,
						onFailure: pageAction,
						...testCase.expected,
					};
					expect( requestPage( pageAction ) ).toEqual( http( expected ) );
				} );
			} );
		} );
	} );

	describe( 'handlePage', () => {
		const data = deepfreeze( {
			posts: [
				{
					blogId: undefined,
					date: undefined,
					feed_ID: undefined,
					feed_URL: undefined,
					postId: undefined,
					site_description: undefined,
					site_icon: undefined,
					site_name: undefined,
					url: undefined,
					xPostMetadata: null,
				},
			],
			date_range: {
				after: '2018',
			},
		} );

		it( 'should return a receivePage action', () => {
			const { streamKey, query } = action.payload;
			const result = handlePage( action, data );
			expect( result ).toEqual( [
				expect.any( Function ), // receivePosts thunk
				receivePage( {
					streamKey,
					query,
					streamItems: data.posts,
					gap: null,
					pageHandle: { before: '2018' },
					totalItems: 1,
					totalPages: 1,
				} ),
			] );
		} );

		it( 'should return a receiveUpdates action when type is a poll', () => {
			const { streamKey, query } = action.payload;
			expect(
				handlePage( { ...action, payload: { ...action.payload, isPoll: true } }, data )
			).toEqual( [
				receiveUpdates( {
					streamKey,
					query,
					streamItems: data.posts,
					gap: null,
					pageHandle: { before: '2018' },
				} ),
			] );
		} );
	} );

	describe( 'handlePage with sites data (custom_recs_sites_with_images)', () => {
		const makeSiteAction = () =>
			makeAction( { streamKey: 'custom_recs_sites_with_images', page: 1 } );

		it( 'should not throw when a site is missing the posts property', () => {
			const siteAction = makeSiteAction();
			const siteData = deepfreeze( { sites: [ { blog_ID: 1 } ] } );
			expect( () => handlePage( siteAction, siteData ) ).not.toThrow();
		} );

		const findReceivePageAction = ( result ) =>
			result.find( ( a ) => typeof a === 'object' && a.type === 'READER_STREAMS_PAGE_RECEIVE' );

		it( 'should skip sites with missing posts and return empty stream items', () => {
			const siteAction = makeSiteAction();
			const siteData = deepfreeze( { sites: [ { blog_ID: 1 } ] } );
			const result = handlePage( siteAction, siteData );
			const receivePageAction = findReceivePageAction( result );
			expect( receivePageAction.payload.streamItems ).toEqual( [] );
		} );

		it( 'should skip sites with an empty posts array', () => {
			const siteAction = makeSiteAction();
			const siteData = deepfreeze( { sites: [ { blog_ID: 1, posts: [] } ] } );
			const result = handlePage( siteAction, siteData );
			const receivePageAction = findReceivePageAction( result );
			expect( receivePageAction.payload.streamItems ).toEqual( [] );
		} );

		it( 'should create stream items from sites with valid posts', () => {
			const siteAction = makeSiteAction();
			const siteData = deepfreeze( {
				sites: [
					{
						blog_ID: 1,
						name: 'Test Site',
						description: 'A test',
						icon: { ico: 'icon.png' },
						posts: [
							{
								ID: 10,
								site_ID: 1,
								date: '2026-01-01',
								URL: 'https://example.com/post',
								feed_ID: 100,
								feed_URL: 'https://example.com/feed',
							},
						],
					},
				],
			} );
			const result = handlePage( siteAction, siteData );
			const receivePageAction = findReceivePageAction( result );
			expect( receivePageAction.payload.streamItems ).toHaveLength( 1 );
			expect( receivePageAction.payload.streamItems[ 0 ] ).toMatchObject( {
				postId: 10,
				date: '2026-01-01',
				url: 'https://example.com/post',
				site_name: 'Test Site',
				site_icon: 'icon.png',
			} );
		} );

		it( 'should handle a mix of sites with and without posts', () => {
			const siteAction = makeSiteAction();
			const siteData = deepfreeze( {
				sites: [
					{
						blog_ID: 1,
						name: 'Valid Site',
						posts: [ { ID: 10, site_ID: 1, date: '2026-01-01', URL: 'https://example.com/a' } ],
					},
					{ blog_ID: 2, name: 'No Posts Property' },
					{ blog_ID: 3, name: 'Empty Posts', posts: [] },
					{
						blog_ID: 4,
						name: 'Another Valid Site',
						posts: [ { ID: 20, site_ID: 4, date: '2026-01-02', URL: 'https://example.com/b' } ],
					},
				],
			} );
			const result = handlePage( siteAction, siteData );
			const receivePageAction = findReceivePageAction( result );
			expect( receivePageAction.payload.streamItems ).toHaveLength( 2 );
		} );
	} );
} );
