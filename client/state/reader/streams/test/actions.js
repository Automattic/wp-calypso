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
import { requestPage } from '../actions';

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

describe( 'requestPage thunk', () => {
	beforeEach( () => {
		mockQueryClient = newClient();
	} );
	afterEach( () => {
		nock.cleanAll();
		mockQueryClient = null;
	} );

	describe( 'unmigrated stream type', () => {
		it( 'dispatches the legacy READER_STREAMS_PAGE_REQUEST', () => {
			const { dispatch } = runThunk( { streamKey: 'site:1234' } );
			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			const action = dispatch.mock.calls[ 0 ][ 0 ];
			expect( action.type ).toBe( READER_STREAMS_PAGE_REQUEST );
			expect( action.payload ).toMatchObject( {
				streamKey: 'site:1234',
				streamType: 'site',
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
} );
