/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';
import { useStreamPendingPosts } from '../use-stream-pending-posts';
import { getStreamInfiniteQueryKey, type PostKey } from '../use-stream-posts';
import type { ReadStreamResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';
const LIKES_PATH = '/rest/v1.2/read/liked';

afterEach( () => {
	nock.cleanAll();
} );

function makeWrapper( queryClient: QueryClient ) {
	const store = createStore( initialReducer, undefined, applyMiddleware( thunkMiddleware ) );
	const Wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
	return { Wrapper, store };
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

interface ApiPost {
	ID: number;
	site_ID: number;
	URL?: string;
	date_liked?: string;
}

function apiPost( id: number ): ApiPost {
	return {
		ID: id,
		site_ID: 100,
		URL: `https://example.com/post-${ id }`,
		date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
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
	} );

	it( 'consumePending swaps pages[0] in the infinite cache and zeros the count', async () => {
		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );

		// Seed the infinite cache with the items the user is currently viewing.
		const infiniteKey = getStreamInfiniteQueryKey( {
			streamKey: 'likes',
			feedId: null,
			localeSlug: null,
			startDate: null,
		} );
		const seededPage: ReadStreamResponse = {
			posts: [ apiPost( 2 ), apiPost( 3 ) ],
			date_range: { after: null, before: null },
		} as ReadStreamResponse;
		queryClient.setQueryData( infiniteKey, {
			pageParams: [ null ],
			pages: [ seededPage ],
		} );

		// The poll picks up a new top post (1) and the existing ones (2, 3).
		const polledHead = {
			posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
			date_range: { after: null, before: null },
		};
		nock( BASE ).get( LIKES_PATH ).query( true ).reply( 200, polledHead );

		const items = [ postKey( 2 ), postKey( 3 ) ];
		const { result } = renderHook(
			() => useStreamPendingPosts( { streamKey: 'likes', items, shouldPoll: true } ),
			{ wrapper: Wrapper }
		);

		await waitFor( () => expect( result.current.pendingCount ).toBe( 1 ) );

		act( () => {
			result.current.consumePending();
		} );

		await waitFor( () => expect( result.current.pendingCount ).toBe( 0 ) );

		const merged = queryClient.getQueryData< {
			pageParams: unknown[];
			pages: ReadStreamResponse[];
		} >( infiniteKey );
		expect( merged?.pages ).toHaveLength( 1 );
		expect( ( merged?.pages?.[ 0 ] as { posts: ApiPost[] } ).posts.map( ( p ) => p.ID ) ).toEqual( [
			1, 2, 3,
		] );
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
