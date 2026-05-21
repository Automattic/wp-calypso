/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { getCachedPost } from 'calypso/reader/data/post-cache';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import initialReducer from 'calypso/state/reducer';
import { useStreamPendingPosts } from '../use-stream-pending-posts';
import { type PostKey } from '../use-stream-posts';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';
const LIKES_PATH = '/rest/v1.2/read/liked';

afterEach( () => {
	nock.cleanAll();
} );

function makeWrapper( queryClient: QueryClient ) {
	const actions: unknown[] = [];
	const actionRecorder = () => ( next: ( action: unknown ) => unknown ) => ( action: unknown ) => {
		actions.push( action );
		return next( action );
	};
	const store = createStore(
		initialReducer,
		undefined,
		applyMiddleware( actionRecorder, thunkMiddleware )
	);
	const Wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
	return { Wrapper, store, actions };
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

interface ApiPost {
	ID: number;
	site_ID: number;
	URL?: string;
	date_liked?: string;
	content?: string;
	railcar?: Record< string, unknown >;
}

function apiPost( id: number, overrides: Partial< ApiPost > = {} ): ApiPost {
	return {
		ID: id,
		site_ID: 100,
		URL: `https://example.com/post-${ id }`,
		date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
		content: `<p>Pending post ${ id }</p>`,
		...overrides,
	};
}

function postKey( id: number, siteId = 100 ): PostKey {
	return { blogId: siteId, postId: id };
}

describe( 'useStreamPendingPosts', () => {
	it( 'returns pendingCount of 0 when items is empty', async () => {
		// Empty items disables the poll query (`enabled: items.length > 0`).
		// No nock mock needed — a request would surface as a nock error.
		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items: [], shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		expect( result.current.pendingCount ).toBe( 0 );
	} );

	it( 'returns pendingCount of 0 and skips fetch when shouldPoll is false', async () => {
		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const items = [ postKey( 1 ) ];
		const { result } = renderHook(
			() =>
				useStreamPendingPosts( {
					streamKey: 'likes',
					items,
					shouldPoll: false,
				} ),
			{ wrapper: Wrapper }
		);

		// Give React Query a microtask to run any synchronous query side-effects.
		await Promise.resolve();
		expect( result.current.pendingCount ).toBe( 0 );
		expect( nock.pendingMocks() ).toHaveLength( 0 );
	} );

	it( 'polls the head and exposes pendingCount for unseen items', async () => {
		// Items 2 and 3 are already visible; the polled head returns 1, 2, 3 so
		// only post 1 is "new" → pendingCount === 1.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const items = [ postKey( 2 ), postKey( 3 ) ];
		const { result } = renderHook(
			() =>
				useStreamPendingPosts( {
					streamKey: 'likes',
					items,
					shouldPoll: true,
				} ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( result.current.pendingCount ).toBe( 1 ) );
		expect( result.current.hasPendingPosts ).toBe( true );
		expect( getCachedPost( queryClient, postKey( 1 ) ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			content_no_html: 'Pending post 1',
			better_excerpt_no_html: 'Pending post 1',
		} );
	} );

	it( 'records railcar render events for polled stream posts', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1, { railcar: { railcar: 'pending-railcar-1' } } ), apiPost( 2 ) ],
				algorithm: 'pending-railcar-test',
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper, actions } = makeWrapper( queryClient );
		const items = [ postKey( 2 ) ];
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items, shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( result.current.pendingCount ).toBe( 1 ) );
		expect( actions ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					type: ANALYTICS_EVENT_RECORD,
					meta: expect.objectContaining( {
						analytics: expect.arrayContaining( [
							expect.objectContaining( {
								payload: expect.objectContaining( {
									name: 'calypso_traintracks_render',
									properties: { railcar: 'pending-railcar-1' },
								} ),
							} ),
						] ),
					} ),
				} ),
			] )
		);
	} );

	it( 'hasPendingPosts is false when there are no pending items', async () => {
		// Polled head matches what is already visible — nothing pending.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const items = [ postKey( 2 ), postKey( 3 ) ];
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items, shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( result.current.pendingCount ).toBe( 0 );
		expect( result.current.hasPendingPosts ).toBe( false );
	} );

	it( 'stops counting at the first item already in items (legacy date-based parity)', async () => {
		// Polled head returns the user's most recent + older posts the user
		// has not loaded yet. Naive set-diff would count those older entries as
		// "pending"; the legacy reducer filtered them out via `lastUpdated`.
		// `useStreamPendingPosts` mirrors that by stopping at the first overlap.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		// User has only post 1 (the most recent) loaded — INITIAL_FETCH < PER_POLL.
		const items = [ postKey( 1 ) ];
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items, shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		// Posts 2 and 3 in the head are older — not pending.
		expect( result.current.pendingCount ).toBe( 0 );
	} );

	it( 'reset() drops the polled head from cache', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const items = [ postKey( 2 ), postKey( 3 ) ];
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items, shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( result.current.pendingCount ).toBe( 1 ) );

		// `resetQueries` re-fetches active observers; mock the second call.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		act( () => {
			result.current.reset();
		} );

		// pendingCount snaps to 0 immediately after reset (data is undefined),
		// and stays 0 once the follow-up fetch lands matching the visible items.
		await waitFor( () => expect( result.current.pendingCount ).toBe( 0 ) );
	} );

	it( 'rotates queryKey on streamKey change so polled head does not bleed across streams', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const items = [ postKey( 2 ) ];
		const { result, rerender } = renderHook(
			( props: { streamKey: string } ) =>
				useStreamPendingPosts( { streamKey: props.streamKey, items, shouldPoll: true } ),
			{ wrapper: Wrapper, initialProps: { streamKey: 'likes' } }
		);

		await waitFor( () => expect( result.current.pendingCount ).toBe( 1 ) );

		// Rotating the streamKey points at a fresh poll-head queryKey that
		// hasn't been fetched yet — pendingCount snaps back to 0 until a new
		// poll lands.
		nock( BASE )
			.get( '/rest/v1.2/read/following' )
			.query( true )
			.reply( 200, {
				posts: [],
				date_range: { after: null, before: null },
			} );
		rerender( { streamKey: 'following' } );
		expect( result.current.pendingCount ).toBe( 0 );
	} );
} );
