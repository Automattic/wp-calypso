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
import { useReaderStream } from '../use-reader-stream';
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
	xPostMetadata?: { blogId: number; postId: number };
}

function apiPost( id: number, overrides: Partial< ApiPost > = {} ): ApiPost {
	return {
		ID: id,
		site_ID: 100,
		URL: `https://example.com/post-${ id }`,
		date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
		...overrides,
	};
}

function postKey( id: number, siteId = 100 ) {
	return { blogId: siteId, postId: id };
}

describe( 'useReaderStream — fetching', () => {
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
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) );
		expect( result.current.items[ 1 ] ).toMatchObject( postKey( 2 ) );
		expect( result.current.lastPage ).toBe( true );
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
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
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

	it( 'reports an error when the fetch fails', async () => {
		nock( BASE ).get( LIKES_PATH ).query( true ).reply( 500, { error: 'kaboom' } );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.error ).toBeTruthy() );
		expect( result.current.items ).toHaveLength( 0 );
	} );
} );

describe( 'useReaderStream — selection', () => {
	async function setupWithItems() {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( result.current.items ).toHaveLength( 3 ) );
		return { result };
	}

	it( 'starts with no selection', async () => {
		const { result } = await setupWithItems();
		expect( result.current.selected ).toBeNull();
	} );

	it( 'selectItem sets the current selection', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectItem( result.current.items[ 1 ] );
		} );
		expect( result.current.selected ).toMatchObject( postKey( 2 ) );
	} );

	it( 'selectNext from null picks the first item', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectNext();
		} );
		expect( result.current.selected ).toMatchObject( postKey( 1 ) );
	} );

	it( 'selectNext advances to the following item', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectItem( result.current.items[ 0 ] );
		} );
		act( () => {
			result.current.selectNext();
		} );
		expect( result.current.selected ).toMatchObject( postKey( 2 ) );
	} );

	it( 'selectNext at the last item stays put', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectItem( result.current.items[ 2 ] );
		} );
		act( () => {
			result.current.selectNext();
		} );
		expect( result.current.selected ).toMatchObject( postKey( 3 ) );
	} );

	it( 'selectPrev from null is a no-op (matches legacy)', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectPrev();
		} );
		expect( result.current.selected ).toBeNull();
	} );

	it( 'selectPrev moves backward', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectItem( result.current.items[ 1 ] );
		} );
		act( () => {
			result.current.selectPrev();
		} );
		expect( result.current.selected ).toMatchObject( postKey( 1 ) );
	} );

	it( 'selectPrev at the first item stays put', async () => {
		const { result } = await setupWithItems();
		act( () => {
			result.current.selectItem( result.current.items[ 0 ] );
		} );
		act( () => {
			result.current.selectPrev();
		} );
		expect( result.current.selected ).toMatchObject( postKey( 1 ) );
	} );

	it( 'selection is preserved after fetching the next page', async () => {
		nock.cleanAll();
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => ! ( 'before' in q ) )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: '2026-04-01', before: null },
			} );
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( q: Record< string, string | string[] | undefined > ) => q.before === '2026-04-01' )
			.reply( 200, {
				posts: [ apiPost( 3 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );

		act( () => {
			result.current.selectItem( result.current.items[ 0 ] );
		} );
		expect( result.current.selected ).toMatchObject( postKey( 1 ) );

		act( () => {
			result.current.fetchNextPage();
		} );
		await waitFor( () => expect( result.current.items ).toHaveLength( 3 ) );

		expect( result.current.selected ).toMatchObject( postKey( 1 ) );
	} );
} );

describe( 'useReaderStream — removeItem', () => {
	it( 'filters the post out of the items list', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );

		act( () => {
			result.current.removeItem( result.current.items[ 0 ] );
		} );

		expect( result.current.items ).toHaveLength( 1 );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 2 ) );
	} );
} );

describe( 'useReaderStream — streamKey change', () => {
	it( 'resets selected and removed state when the streamKey changes', async () => {
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
			.reply( 200, {
				posts: [ apiPost( 99 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const { result, rerender } = renderHook(
			( { streamKey }: { streamKey: string } ) => useReaderStream( { streamKey } ),
			{ wrapper: Wrapper, initialProps: { streamKey: 'likes' } }
		);

		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		act( () => {
			result.current.selectItem( result.current.items[ 0 ] );
			result.current.removeItem( result.current.items[ 1 ] );
		} );
		expect( result.current.selected ).toMatchObject( postKey( 1 ) );
		expect( result.current.items ).toHaveLength( 1 );

		rerender( { streamKey: 'following' } );

		await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 99 ) ) );
		expect( result.current.selected ).toBeNull();
		// `removedIds` from the previous stream must not bleed in either.
		expect( result.current.items ).toHaveLength( 1 );
	} );
} );

describe( 'useReaderStream — keepPreviousData', () => {
	it( 'keeps the previous stream items on screen while the new query loads', async () => {
		// First stream resolves immediately.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				date_range: { after: null, before: null },
			} );
		// Second stream is delayed so we can observe the placeholder window.
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
			( { streamKey }: { streamKey: string } ) => useReaderStream( { streamKey } ),
			{ wrapper: Wrapper, initialProps: { streamKey: 'likes' } }
		);
		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		expect( result.current.isPlaceholderData ).toBe( false );

		// Switch streamKey — old items must remain visible while the new query
		// loads, with `isPlaceholderData` flipping to true.
		rerender( { streamKey: 'following' } );
		expect( result.current.items ).toHaveLength( 2 );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) );
		expect( result.current.isPlaceholderData ).toBe( true );

		// Once the new fetch resolves, items swap and placeholder flag clears.
		await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 99 ) ) );
		expect( result.current.isPlaceholderData ).toBe( false );
		expect( result.current.items ).toHaveLength( 1 );
	} );
} );

describe( 'useReaderStream — cache (stale-while-revalidate)', () => {
	it( 'second mount with the same QueryClient hits cache without refetching', async () => {
		// First mount: one network call satisfies the page.
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				date_range: { after: null, before: null },
			} );

		const queryClient = makeQueryClient();
		const { Wrapper } = makeWrapper( queryClient );
		const first = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );
		await waitFor( () => expect( first.result.current.items ).toHaveLength( 1 ) );
		first.unmount();

		// nock has no more interceptors registered — if the second mount tried
		// to fetch again, the request would 404 / time out.
		expect( nock.pendingMocks() ).toHaveLength( 0 );

		const second = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
			wrapper: Wrapper,
		} );

		// Synchronous cache hit: items are populated on the very first render,
		// no `isLoading: true` window. This is what makes the skeleton skip
		// for warm Reader navigations.
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

		// Two independent QueryClients (mimics a hard reload without
		// rehydration from storage).
		{
			const { Wrapper } = makeWrapper( makeQueryClient() );
			const { result, unmount } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
				wrapper: Wrapper,
			} );
			await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) ) );
			unmount();
		}
		{
			const { Wrapper } = makeWrapper( makeQueryClient() );
			const { result } = renderHook( () => useReaderStream( { streamKey: 'likes' } ), {
				wrapper: Wrapper,
			} );
			await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 2 ) ) );
		}

		// Both interceptors fired.
		expect( nock.isDone() ).toBe( true );
	} );
} );

// Note: x-post deduplication via `combineXPosts` is exercised end-to-end by
// the slice's own `normalize` tests (`client/state/reader/streams/test/normalize.js`).
// The hook just composes that helper; trusting it here keeps the test surface
// focused on streaming behavior we own.
