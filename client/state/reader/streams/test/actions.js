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
} );
