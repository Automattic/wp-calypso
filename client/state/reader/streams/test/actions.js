/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_UPDATES_RECEIVE,
	READER_STREAMS_ERROR,
	READER_POSTS_RECEIVE,
	READER_RECOMMENDED_SITES_RECEIVE,
} from 'calypso/state/reader/action-types';
import { requestPage, requestPaginatedStream } from '../actions';

const BASE = 'https://public-api.wordpress.com';

let mockQueryClient = null;

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: () => mockQueryClient,
} ) );

// Hide railcar/analytics noise in receivePosts.
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/reader/stats', () => ( { recordTrack: () => {}, pageViewForPost: () => {} } ) );

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function runThunk( params ) {
	const dispatch = jest.fn( ( action ) => {
		// Pass thunks through (e.g. receivePosts is itself a thunk that dispatches READER_POSTS_RECEIVE).
		if ( typeof action === 'function' ) {
			return action( dispatch, () => ( {} ) );
		}
		return action;
	} );
	const result = requestPage( params )( dispatch );
	return { dispatch, result };
}

function runPaginatedThunk( params ) {
	const dispatch = jest.fn( ( action ) => {
		if ( typeof action === 'function' ) {
			return action( dispatch, () => ( {} ) );
		}
		return action;
	} );
	const result = requestPaginatedStream( params )( dispatch );
	return { dispatch, result };
}

beforeEach( () => {
	mockQueryClient = newClient();
} );
afterEach( () => {
	nock.cleanAll();
	mockQueryClient = null;
} );

describe( 'requestPage thunk', () => {
	describe( 'unmigrated stream type', () => {
		it( 'dispatches the legacy READER_STREAMS_PAGE_REQUEST', () => {
			const { dispatch } = runThunk( { streamKey: 'recommendations_posts' } );
			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			const action = dispatch.mock.calls[ 0 ][ 0 ];
			expect( action.type ).toBe( READER_STREAMS_PAGE_REQUEST );
			expect( action.payload ).toMatchObject( {
				streamKey: 'recommendations_posts',
				streamType: 'recommendations_posts',
				isPoll: false,
			} );
		} );
	} );

	describe( 'migrated `following` stream', () => {
		const followingResponse = {
			posts: [
				{
					ID: 10,
					site_ID: 200,
					feed_ID: 999,
					feed_item_ID: 50,
					date: '2026-01-01',
					URL: 'https://example.com/post-10',
					site_name: 'Example',
				},
			],
			date_range: { after: '2026-01-01' },
			found: 1,
		};

		it( 'fetches and dispatches PAGE_REQUEST, receivePosts, then receivePage in order', async () => {
			nock( BASE ).get( '/rest/v1.2/read/following' ).query( true ).reply( 200, followingResponse );

			const { dispatch, result } = runThunk( { streamKey: 'following' } );
			await result;

			const types = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && typeof a === 'object' && a.type )
				.map( ( a ) => a.type );

			// PAGE_REQUEST must be dispatched first so the reducer's
			// `isRequesting`/`error` transitions still fire for migrated streams.
			// receivePosts dispatches READER_POSTS_RECEIVE; receivePage dispatches READER_STREAMS_PAGE_RECEIVE.
			const requestIdx = types.indexOf( READER_STREAMS_PAGE_REQUEST );
			const postsIdx = types.indexOf( READER_POSTS_RECEIVE );
			const pageIdx = types.indexOf( READER_STREAMS_PAGE_RECEIVE );
			expect( requestIdx ).toBe( 0 );
			expect( postsIdx ).toBeGreaterThan( requestIdx );
			expect( pageIdx ).toBeGreaterThan( postsIdx );
		} );

		it( 'extracts the page handle from date_range.after', async () => {
			nock( BASE ).get( '/rest/v1.2/read/following' ).query( true ).reply( 200, followingResponse );

			const { dispatch, result } = runThunk( { streamKey: 'following' } );
			await result;

			const receivePageAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );
			expect( receivePageAction.payload.pageHandle ).toEqual( { before: '2026-01-01' } );
			expect( receivePageAction.payload.streamItems ).toHaveLength( 1 );
		} );

		it( 'dispatches only receiveUpdates when isPoll is true', async () => {
			nock( BASE ).get( '/rest/v1.2/read/following' ).query( true ).reply( 200, followingResponse );

			const { dispatch, result } = runThunk( { streamKey: 'following', isPoll: true } );
			await result;

			const types = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && typeof a === 'object' && a.type )
				.map( ( a ) => a.type );
			expect( types ).toContain( READER_STREAMS_UPDATES_RECEIVE );
			expect( types ).not.toContain( READER_STREAMS_PAGE_RECEIVE );
		} );

		it( 'dispatches receiveStreamError on a failed fetch', async () => {
			nock( BASE )
				.get( '/rest/v1.2/read/following' )
				.query( true )
				.reply( 500, { error: 'server' } );

			const { dispatch, result } = runThunk( { streamKey: 'following' } );
			await result;

			const errorAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_ERROR );
			expect( errorAction ).toBeDefined();
			expect( errorAction.payload.streamKey ).toBe( 'following' );
			expect( errorAction.payload.error ).toBeDefined();
		} );

		it( 'falls back to a direct fetch when the QueryClient is null', async () => {
			mockQueryClient = null;
			nock( BASE ).get( '/rest/v1.2/read/following' ).query( true ).reply( 200, followingResponse );

			const { dispatch, result } = runThunk( { streamKey: 'following' } );
			await result;

			const types = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && typeof a === 'object' && a.type )
				.map( ( a ) => a.type );
			expect( types ).toContain( READER_STREAMS_PAGE_RECEIVE );
		} );
	} );

	describe( 'migrated `discover:recommended` stream', () => {
		const cardsResponse = {
			cards: [
				{
					type: 'post',
					data: {
						ID: 11,
						site_ID: 201,
						feed_ID: 998,
						feed_item_ID: 51,
						date: '2026-02-01',
						URL: 'https://example.com/post-11',
						site_name: 'Discover Example',
					},
				},
				{
					type: 'recommended_blogs',
					data: [
						{
							feed_ID: 700,
							URL: 'https://recommended.example.com',
							name: 'Recommended Blog',
							feed_URL: 'https://recommended.example.com/feed',
							icon: { ico: 'icon.png' },
						},
					],
				},
				{
					type: 'new_sites',
					data: [
						{
							feed_ID: 800,
							URL: 'https://newsite.example.com',
							name: 'New Site',
							feed_URL: 'https://newsite.example.com/feed',
						},
					],
				},
			],
			total_cards: 1,
		};

		it( 'hits /wpcom/v2/read/streams/discover with the discover-specific params', async () => {
			let capturedQuery;
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( ( q ) => {
					capturedQuery = q;
					return true;
				} )
				.reply( 200, cardsResponse );

			const { result } = runThunk( { streamKey: 'discover:recommended' } );
			await result;

			expect( capturedQuery ).toMatchObject( {
				tag_recs_per_card: '5',
				site_recs_per_card: '5',
				age_based_decay: '0.5',
				orderBy: 'popular',
			} );
		} );

		it( 'splits cards into posts + recommendedSites and dispatches both seeds', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( true )
				.reply( 200, cardsResponse );

			const { dispatch, result } = runThunk( { streamKey: 'discover:recommended' } );
			await result;

			const recommendedSiteActions = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && a.type === READER_RECOMMENDED_SITES_RECEIVE );

			const seeds = recommendedSiteActions.map( ( a ) => a.seed );
			expect( seeds ).toEqual(
				expect.arrayContaining( [ 'discover-recommendations', 'discover-new-sites' ] )
			);
		} );

		it( 'rewrites streamKey using user_interests for the bare discover:recommended request', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( true )
				.reply( 200, { ...cardsResponse, user_interests: [ 'photography', 'travel' ] } );

			const { dispatch, result } = runThunk( { streamKey: 'discover:recommended' } );
			await result;

			const receivePageAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );

			// Tags are sorted by buildDiscoverStreamKey so the streamKey is stable
			// regardless of input order.
			expect( receivePageAction.payload.streamKey ).toBe(
				'discover:recommended--photography--travel'
			);
		} );

		it( 'does not rewrite streamKey when one already includes user-interest tags', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( true )
				.reply( 200, { ...cardsResponse, user_interests: [ 'photography' ] } );

			const { dispatch, result } = runThunk( {
				streamKey: 'discover:recommended--photography--travel',
			} );
			await result;

			const receivePageAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );
			expect( receivePageAction.payload.streamKey ).toBe(
				'discover:recommended--photography--travel'
			);
		} );

		it( 'does not dispatch recommended-site actions when there are no card sites', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( true )
				.reply( 200, { cards: [ cardsResponse.cards[ 0 ] ] } );

			const { dispatch, result } = runThunk( { streamKey: 'discover:recommended' } );
			await result;

			const types = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && typeof a === 'object' && a.type )
				.map( ( a ) => a.type );
			expect( types ).not.toContain( READER_RECOMMENDED_SITES_RECEIVE );
			expect( types ).toContain( READER_STREAMS_PAGE_RECEIVE );
		} );
	} );

	describe( 'other migrated `discover` sub-tabs', () => {
		const postsResponse = {
			posts: [
				{
					ID: 12,
					site_ID: 202,
					feed_ID: 997,
					feed_item_ID: 52,
					date: '2026-03-01',
					URL: 'https://example.com/post-12',
					site_name: 'Latest Example',
				},
			],
			date_range: { after: '2026-03-01' },
			found: 1,
		};

		it( 'discover:latest hits /wpcom/v2/read/tags/posts with orderBy=date', async () => {
			let capturedQuery;
			nock( BASE )
				.get( '/wpcom/v2/read/tags/posts' )
				.query( ( q ) => {
					capturedQuery = q;
					return true;
				} )
				.reply( 200, postsResponse );

			const { dispatch, result } = runThunk( { streamKey: 'discover:latest' } );
			await result;

			expect( capturedQuery ).toMatchObject( {
				tag_recs_per_card: '5',
				site_recs_per_card: '5',
				age_based_decay: '0.5',
				orderBy: 'date',
			} );
			const types = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.filter( ( a ) => a && typeof a === 'object' && a.type )
				.map( ( a ) => a.type );
			expect( types ).toContain( READER_STREAMS_PAGE_RECEIVE );
		} );

		it( 'discover:tags falls back to /wpcom/v2/read/streams/discover with the tag in the path', async () => {
			let capturedQuery;
			nock( BASE )
				.get( '/wpcom/v2/read/streams/discover' )
				.query( ( q ) => {
					capturedQuery = q;
					return true;
				} )
				.reply( 200, postsResponse );

			const { result } = runThunk( { streamKey: 'discover:dailyprompt' } );
			await result;

			// `tags=dailyprompt` lives in the path; the rest of the params still get
			// the discover extras with orderBy=date (since suffix !== `recommended`).
			expect( capturedQuery ).toMatchObject( {
				tags: 'dailyprompt',
				orderBy: 'date',
			} );
		} );

		it( 'discover:freshly-pressed hits /rest/v1.2/freshly-pressed without discover extras', async () => {
			let capturedQuery;
			nock( BASE )
				.get( '/rest/v1.2/freshly-pressed' )
				.query( ( q ) => {
					capturedQuery = q;
					return true;
				} )
				.reply( 200, postsResponse );

			const { result } = runThunk( { streamKey: 'discover:freshly-pressed' } );
			await result;

			// freshly-pressed only sends the base stream params; the discover
			// extras (tags, age decay, recs-per-card) must not be merged in.
			expect( capturedQuery ).not.toHaveProperty( 'tag_recs_per_card' );
			expect( capturedQuery ).not.toHaveProperty( 'site_recs_per_card' );
			expect( capturedQuery ).not.toHaveProperty( 'age_based_decay' );
			expect( capturedQuery ).not.toHaveProperty( 'tags' );
			// Legacy parity: this sub-tab bypassed `getQueryString`, so the
			// default `orderBy=date`, `meta`, and `content_width` must not be
			// added by the migrated path either.
			expect( capturedQuery ).not.toHaveProperty( 'orderBy' );
			expect( capturedQuery ).not.toHaveProperty( 'meta' );
			expect( capturedQuery ).not.toHaveProperty( 'content_width' );
		} );

		it( 'does not rewrite streamKey for non-recommended sub-tabs even when user_interests is present', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/tags/posts' )
				.query( true )
				.reply( 200, { ...postsResponse, user_interests: [ 'travel' ] } );

			const { dispatch, result } = runThunk( { streamKey: 'discover:latest' } );
			await result;

			const receivePageAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );
			expect( receivePageAction.payload.streamKey ).toBe( 'discover:latest' );
		} );
	} );

	const baseResponse = {
		posts: [
			{
				ID: 99,
				site_ID: 555,
				feed_ID: 444,
				feed_item_ID: 22,
				date: '2026-04-01',
				URL: 'https://example.com/post-99',
				site_name: 'Example',
			},
		],
		date_range: { after: '2026-04-01' },
		found: 1,
	};

	// Each case asserts the migrated thunk hits the legacy URL with the
	// legacy query shape (number/lang/orderBy/meta defaults from
	// getQueryString unless the stream historically bypassed it).
	it.each( [
		{
			name: 'recent without suffix',
			streamKey: 'recent',
			path: '/wpcom/v2/read/streams/following',
			expectedQuery: { orderBy: 'date', meta: 'post,discover_original_post' },
			notInQuery: [ 'feed_id' ],
		},
		{
			name: 'recent with feed suffix',
			streamKey: 'recent:1234',
			path: '/wpcom/v2/read/streams/following',
			expectedQuery: { feed_id: '1234' },
		},
		{
			name: 'search parses sort+q from JSON suffix',
			streamKey: 'search:{"sort":"relevance","q":"react"}',
			path: '/rest/v1.2/read/search',
			expectedQuery: { sort: 'relevance', q: 'react', content_width: '675' },
			// Search historically bypassed getQueryString, so meta/orderBy must NOT be added.
			notInQuery: [ 'meta', 'orderBy' ],
		},
		{
			name: 'feed',
			streamKey: 'feed:1234',
			path: '/rest/v1.2/read/feed/1234/posts',
			expectedQuery: { orderBy: 'date', meta: 'post,discover_original_post' },
		},
		{
			name: 'site',
			streamKey: 'site:1234',
			path: '/rest/v1.2/read/sites/1234/posts',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'notifications',
			streamKey: 'notifications',
			path: '/rest/v1.2/read/notifications',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'featured',
			streamKey: 'featured:1234',
			path: '/rest/v1.2/read/sites/1234/featured',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'p2',
			streamKey: 'p2',
			path: '/rest/v1.2/read/following/p2',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'a8c',
			streamKey: 'a8c',
			path: '/rest/v1.2/read/a8c',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'tag',
			streamKey: 'tag:photography',
			path: '/wpcom/v2/read/tags/photography/posts',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'tag_popular',
			streamKey: 'tag_popular:photography',
			path: '/wpcom/v2/read/streams/tag/photography',
			expectedQuery: {
				tags: 'photography',
				tag_recs_per_card: '5',
				site_recs_per_card: '5',
			},
		},
		{
			name: 'on_this_day without month/day',
			streamKey: 'on_this_day',
			path: '/wpcom/v2/read/streams/on-this-day',
			expectedQuery: { number: '15' },
			notInQuery: [ 'month', 'day' ],
		},
		{
			name: 'on_this_day with month/day',
			streamKey: 'on_this_day:3:15',
			path: '/wpcom/v2/read/streams/on-this-day',
			expectedQuery: { number: '15', month: '3', day: '15' },
		},
		{
			name: 'user',
			streamKey: 'user:42',
			path: '/rest/v1/users/42/posts',
			expectedQuery: { orderBy: 'date' },
		},
		{
			name: 'likes',
			streamKey: 'likes',
			path: '/rest/v1.2/read/liked',
			expectedQuery: { orderBy: 'date', meta: 'post,discover_original_post' },
		},
	] )( '$name hits $path with the right query', async ( c ) => {
		let captured;
		nock( BASE )
			.get( c.path )
			.query( ( q ) => {
				captured = q;
				return true;
			} )
			.reply( 200, baseResponse );

		const { result } = runThunk( { streamKey: c.streamKey } );
		await result;

		expect( captured ).toMatchObject( c.expectedQuery );
		for ( const key of c.notInQuery ?? [] ) {
			expect( captured ).not.toHaveProperty( key );
		}
	} );

	// The legacy `streamApis.list.query` shipped a typoed spread that
	// dropped meta/orderBy/content_width/lang from the wire query. The
	// migration fixes it — assert that the new shape is sent and the old
	// nested `extras` literal key is gone.
	it( 'list now sends the same enriched shape as other streams (bug fixed)', async () => {
		let captured;
		nock( BASE )
			.get( '/rest/v1.3/read/list/alice/favs/posts' )
			.query( ( q ) => {
				captured = q;
				return true;
			} )
			.reply( 200, baseResponse );

		const { result } = runThunk( {
			streamKey: 'list:{"owner":"alice","slug":"favs"}',
		} );
		await result;

		expect( captured ).toMatchObject( {
			orderBy: 'date',
			meta: 'post,discover_original_post',
			content_width: '675',
			number: '40',
		} );
		expect( captured.lang ).toBeDefined();
		// The legacy bug nested the extras under a literal key — confirm gone.
		expect( captured ).not.toHaveProperty( 'extras' );
	} );

	// `user` had a custom poll query (`number: 20`); other streams use the
	// PER_POLL default. Verify the override survives the migration.
	it( 'user poll overrides number to 20', async () => {
		let captured;
		nock( BASE )
			.get( '/rest/v1/users/42/posts' )
			.query( ( q ) => {
				captured = q;
				return true;
			} )
			.reply( 200, baseResponse );

		const { result } = runThunk( { streamKey: 'user:42', isPoll: true } );
		await result;

		expect( captured.number ).toBe( '20' );
	} );

	// `likes` has a non-default `dateProperty` (`date_liked`) and a custom
	// poll query (`fields=…,date_liked`). Verify both survived the migration.
	describe( 'likes stream specifics', () => {
		// Two posts whose `date_liked` order intentionally diverges from `date`
		// so we can confirm the thunk uses `date_liked` to build streamItems.
		const likesResponse = {
			posts: [
				{
					ID: 30,
					site_ID: 300,
					feed_ID: 990,
					feed_item_ID: 70,
					date: '2026-01-01',
					date_liked: '2026-04-10',
					URL: 'https://example.com/post-30',
					site_name: 'Liked Example A',
				},
				{
					ID: 31,
					site_ID: 301,
					feed_ID: 991,
					feed_item_ID: 71,
					date: '2026-04-15',
					date_liked: '2026-02-20',
					URL: 'https://example.com/post-31',
					site_name: 'Liked Example B',
				},
			],
			date_range: { after: '2026-02-20' },
			found: 2,
		};

		it( 'builds streamItems using `date_liked` instead of `date`', async () => {
			nock( BASE ).get( '/rest/v1.2/read/liked' ).query( true ).reply( 200, likesResponse );

			const { dispatch, result } = runThunk( { streamKey: 'likes' } );
			await result;

			const receivePageAction = dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );
			const dates = receivePageAction.payload.streamItems.map( ( item ) => item.date );
			expect( dates ).toEqual( [ '2026-04-10', '2026-02-20' ] );
		} );

		it( 'sends `date_liked` in the poll fields query param', async () => {
			let captured;
			nock( BASE )
				.get( '/rest/v1.2/read/liked' )
				.query( ( q ) => {
					captured = q;
					return true;
				} )
				.reply( 200, likesResponse );

			const { result } = runThunk( { streamKey: 'likes', isPoll: true } );
			await result;

			expect( captured.fields ).toBeDefined();
			expect( captured.fields.split( ',' ) ).toContain( 'date_liked' );
		} );

		it( 'does not send the selected Recent feed id in the poll query', async () => {
			let captured;
			nock( BASE )
				.get( '/rest/v1.2/read/liked' )
				.query( ( q ) => {
					captured = q;
					return true;
				} )
				.reply( 200, likesResponse );

			const { result } = runThunk( { streamKey: 'likes', isPoll: true, feedId: 1234 } );
			await result;

			expect( captured ).not.toHaveProperty( 'feed_id' );
		} );
	} );
} );

describe( 'requestPaginatedStream thunk', () => {
	const recentResponse = {
		posts: [
			{
				ID: 7,
				site_ID: 7,
				feed_ID: 7,
				feed_item_ID: 7,
				date: '2026-05-01',
				URL: 'https://example.com/post-7',
				site_name: 'Recent',
			},
		],
		total_pages: 3,
		found: 25,
	};

	it( 'routes migrated `recent` through React Query with page+perPage', async () => {
		let captured;
		nock( BASE )
			.get( '/wpcom/v2/read/streams/following' )
			.query( ( q ) => {
				captured = q;
				return true;
			} )
			.reply( 200, recentResponse );

		const { dispatch, result } = runPaginatedThunk( {
			streamKey: 'recent',
			page: 2,
			perPage: 10,
		} );
		await result;

		expect( captured.page ).toBe( '2' );
		expect( captured.number ).toBe( '10' );

		const types = dispatch.mock.calls
			.map( ( c ) => c[ 0 ] )
			.filter( ( a ) => a && typeof a === 'object' && a.type )
			.map( ( a ) => a.type );
		expect( types ).toContain( READER_STREAMS_PAGE_RECEIVE );
	} );

	it( 'returns the legacy action for unmigrated streamKey', () => {
		const { dispatch, result } = runPaginatedThunk( {
			streamKey: 'recommendations_posts',
			page: 1,
			perPage: 10,
		} );
		// Action object returned, not a Promise — legacy data-layer
		// path. The first dispatch carried the same action.
		expect( result ).toMatchObject( {
			type: 'READER_STREAMS_PAGINATED_REQUEST',
			payload: { streamKey: 'recommendations_posts', page: 1, perPage: 10 },
		} );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not collapse overlapping page requests for the same streamKey', async () => {
		// Both pages in flight at once must hit the network independently —
		// otherwise `fetchQuery` dedups them and page 2 receives page 1's rows.
		const page1Response = {
			...recentResponse,
			posts: [
				{
					...recentResponse.posts[ 0 ],
					ID: 1,
					feed_item_ID: 1,
					URL: 'https://example.com/post-1',
				},
			],
		};
		const page2Response = {
			...recentResponse,
			posts: [
				{
					...recentResponse.posts[ 0 ],
					ID: 2,
					feed_item_ID: 2,
					URL: 'https://example.com/post-2',
				},
			],
		};

		nock( BASE )
			.get( '/wpcom/v2/read/streams/following' )
			.query( ( q ) => q.page === '1' )
			.reply( 200, page1Response );
		nock( BASE )
			.get( '/wpcom/v2/read/streams/following' )
			.query( ( q ) => q.page === '2' )
			.reply( 200, page2Response );

		const { dispatch: dispatch1, result: result1 } = runPaginatedThunk( {
			streamKey: 'recent',
			page: 1,
			perPage: 10,
		} );
		const { dispatch: dispatch2, result: result2 } = runPaginatedThunk( {
			streamKey: 'recent',
			page: 2,
			perPage: 10,
		} );
		await Promise.all( [ result1, result2 ] );

		const findReceive = ( dispatch ) =>
			dispatch.mock.calls
				.map( ( c ) => c[ 0 ] )
				.find( ( a ) => a && a.type === READER_STREAMS_PAGE_RECEIVE );

		const receive1 = findReceive( dispatch1 );
		const receive2 = findReceive( dispatch2 );

		expect( receive1.payload.page ).toBe( 1 );
		expect( receive2.payload.page ).toBe( 2 );
		expect( receive1.payload.streamItems[ 0 ].postId ).not.toBe(
			receive2.payload.streamItems[ 0 ].postId
		);
	} );
} );
