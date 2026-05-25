/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { getCachedPost } from 'calypso/reader/data/post-cache';
import { createPostCacheMiddleware } from 'calypso/reader/data/post-cache-middleware';
import readerReducer from 'calypso/state/reader/reducer';
import { getStreamInfiniteQueryKey, useStreamPosts } from '../use-stream-posts';
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
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware(
			actionRecorder,
			thunkMiddleware,
			createPostCacheMiddleware( () => queryClient )
		)
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
	global_ID?: string;
	URL?: string;
	date_liked?: string;
	xPostMetadata?: { blogId: number; postId: number };
	railcar?: Record< string, unknown >;
}

function apiPost( id: number, overrides: Partial< ApiPost > = {} ): ApiPost {
	return {
		ID: id,
		site_ID: 100,
		global_ID: `global-${ id }`,
		URL: `https://example.com/post-${ id }`,
		date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
		...overrides,
	};
}

function postKey( id: number, siteId = 100 ) {
	return { blogId: siteId, postId: id };
}

describe( 'useStreamPosts — fetching', () => {
	it( 'fetches the initial likes page and exposes items', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) );
		expect( result.current.items[ 1 ] ).toMatchObject( postKey( 2 ) );
		expect( getCachedPost( queryClient, postKey( 1 ) ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
		expect( result.current.lastPage ).toBe( true );
	} );

	it( 'exposes pages for stream-level render analytics without dispatching them', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1, { railcar: { railcar: 'railcar-1' } } ) ],
				algorithm: 'railcar-test',
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper, actions } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 1 ) );
		expect( result.current.pages ).toHaveLength( 1 );
		expect( result.current.pages[ 0 ] ).toMatchObject( { algorithm: 'railcar-test' } );
		expect( actions ).toHaveLength( 0 );
	} );

	it( 'paginates via the `before` cursor when `date_range.after` is set', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => ! ( 'before' in q ) )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				date_range: { after: '2026-04-01', before: null },
			} );

		nock( BASE )
			.get( LIKES_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => q.before === '2026-04-01' )
			.reply( 200, {
				posts: [ apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 1 ) );
		expect( result.current.lastPage ).toBe( false );

		act( () => {
			result.current.fetchNextPage();
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		expect( result.current.items[ 1 ] ).toMatchObject( postKey( 2 ) );
		expect( result.current.lastPage ).toBe( true );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'stops paginating when a page returns no posts even if `meta.next_page` is set', async () => {
		const CONVERSATIONS_PATH = '/rest/v1.2/read/conversations';
		nock( BASE )
			.get( CONVERSATIONS_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => ! ( 'page_handle' in q ) )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				meta: { next_page: 'algorithm=read:comments:recent/1&last_post_id=1' },
			} );

		nock( BASE )
			.get( CONVERSATIONS_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => 'page_handle' in q )
			.reply( 200, {
				posts: [],
				// Conversations keeps echoing a cursor past the end of the stream;
				// without the empty-page guard the infinite query would loop here.
				meta: { next_page: 'algorithm=read:comments:recent/1' },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'conversations' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 1 ) );

		act( () => {
			result.current.fetchNextPage();
		} );

		await waitFor( () => expect( result.current.lastPage ).toBe( true ) );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.items ).toHaveLength( 1 );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'reports an error when the fetch fails', async () => {
		nock( BASE ).get( LIKES_PATH ).query( true ).reply( 500, { error: 'kaboom' } );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.error ).toBeTruthy() );
		expect( result.current.items ).toHaveLength( 0 );
	} );

	it( 'uses startDate as initial before cursor when provided', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => q.before === '2026-04-01' )
			.reply( 200, {
				posts: [ apiPost( 5 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook(
			() => useStreamPosts( { streamKey: 'likes', startDate: '2026-04-01' } ),
			{
				wrapper: Wrapper,
			}
		);

		await waitFor( () => expect( result.current.items ).toHaveLength( 1 ) );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 5 ) );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'does not fetch when enabled is false', async () => {
		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook(
			() => useStreamPosts( { streamKey: 'likes', options: { enabled: false } } ),
			{
				wrapper: Wrapper,
			}
		);

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.items ).toHaveLength( 0 );
		expect( nock.isDone() ).toBe( true );
	} );
} );

describe( 'useStreamPosts — stream switch', () => {
	it( 'clears items and flips isLoading when the streamKey changes', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );
		nock( BASE )
			.get( '/rest/v1.2/read/following' )
			.query( true )
			.delay( 100 )
			.reply( 200, {
				posts: [ apiPost( 99 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result, rerender } = renderHook(
			( { streamKey }: { streamKey: string } ) => useStreamPosts( { streamKey } ),
			{ wrapper: Wrapper, initialProps: { streamKey: 'likes' } }
		);
		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );

		rerender( { streamKey: 'following' } );
		expect( result.current.items ).toHaveLength( 0 );
		expect( result.current.isLoading ).toBe( true );

		await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 99 ) ) );
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.items ).toHaveLength( 1 );
	} );
} );

describe( 'useStreamPosts — cache (stale-while-revalidate)', () => {
	it( 'second mount with the same QueryClient hits cache without refetching', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const first = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( first.result.current.items ).toHaveLength( 1 ) );
		first.unmount();

		expect( nock.pendingMocks() ).toHaveLength( 0 );

		const second = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		expect( second.result.current.items ).toHaveLength( 1 );
		expect( second.result.current.isLoading ).toBe( false );
	} );

	it( 'a fresh QueryClient does refetch (cache is per-client)', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				date_range: { after: null, before: null },
			} );
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );

		{
			const { Wrapper } = makeWrapper( makeQueryClient() );
			const { result, unmount } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
				wrapper: Wrapper,
			} );
			await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) ) );
			unmount();
		}
		{
			const { Wrapper } = makeWrapper( makeQueryClient() );
			const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
				wrapper: Wrapper,
			} );
			await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 2 ) ) );
		}

		expect( nock.isDone() ).toBe( true );
	} );
} );

describe( 'useStreamPosts — cache replacement', () => {
	it( 'updates cached posts when the first cached page is replaced', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useStreamPosts( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );

		act( () => {
			queryClient.setQueryData(
				getStreamInfiniteQueryKey( {
					streamKey: 'likes',
					feedId: null,
					localeSlug: null,
					startDate: null,
				} ),
				{
					pageParams: [ null ],
					pages: [
						{
							posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
							date_range: { after: null, before: null },
						},
					],
				}
			);
		} );

		await waitFor( () =>
			expect( getCachedPost( queryClient, postKey( 1 ) ) ).toMatchObject( { ID: 1 } )
		);
	} );
} );
