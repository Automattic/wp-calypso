/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { getCachedPost } from 'calypso/reader/data/post-cache';
import { createPostCacheMiddleware } from 'calypso/reader/data/post-cache-middleware';
import { fetchPaginatedStream, usePaginatedStream } from 'calypso/reader/data/stream';
import readerReducer from 'calypso/state/reader/reducer';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';
const LIKES_PATH = '/rest/v1.2/read/liked';

afterEach( () => {
	nock.cleanAll();
} );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient ) => {
	const store = createStore(
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware(
			thunkMiddleware,
			createPostCacheMiddleware( () => queryClient )
		)
	);

	return ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
};

interface ApiPost {
	ID: number;
	site_ID: number;
	global_ID?: string;
	URL?: string;
	date_liked?: string;
}

const apiPost = ( id: number, overrides: Partial< ApiPost > = {} ): ApiPost => ( {
	ID: id,
	site_ID: 100,
	global_ID: `global-${ id }`,
	URL: `https://example.com/post-${ id }`,
	date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
	...overrides,
} );

const postKey = ( id: number, siteId = 100 ) => ( { blogId: siteId, postId: id } );

describe( 'usePaginatedStream', () => {
	it( 'fetches a page imperatively and syncs posts to the canonical post cache', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				found: 1,
				total_pages: 1,
			} );

		const queryClient = makeQueryClient();
		const dispatch = jest.fn();

		await fetchPaginatedStream( queryClient, dispatch, {
			streamKey: 'likes',
			page: 1,
			perPage: 2,
		} );

		expect( getCachedPost( queryClient, postKey( 1 ) ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'loads a requested page and syncs posts to the canonical post cache', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 1 ), apiPost( 2 ) ],
				found: 4,
				total_pages: 2,
			} );

		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => usePaginatedStream( { streamKey: 'likes', page: 1, perPage: 2 } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		await waitFor( () => expect( result.current.items ).toHaveLength( 2 ) );
		expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) );
		expect( result.current.items[ 1 ] ).toMatchObject( postKey( 2 ) );
		expect( result.current.pagination ).toEqual( { totalItems: 4, totalPages: 2 } );
		expect( result.current.isRequesting ).toBe( false );
		expect( getCachedPost( queryClient, postKey( 1 ) ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
	} );

	it( 'keeps locale-specific pages isolated in the paginated stream cache', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( query: Record< string, string | string[] | undefined > ) =>
				String( query.lang ).includes( 'pt-br' )
			)
			.reply( 200, {
				posts: [ apiPost( 1 ) ],
				found: 1,
				total_pages: 1,
			} );
		nock( BASE )
			.get( LIKES_PATH )
			.query( ( query: Record< string, string | string[] | undefined > ) =>
				String( query.lang ).includes( 'es' )
			)
			.reply( 200, {
				posts: [ apiPost( 2 ) ],
				found: 1,
				total_pages: 1,
			} );

		const queryClient = makeQueryClient();
		const { result, rerender } = renderHook(
			( { localeSlug }: { localeSlug: string } ) =>
				usePaginatedStream( { streamKey: 'likes', page: 1, perPage: 2, localeSlug } ),
			{ wrapper: makeWrapper( queryClient ), initialProps: { localeSlug: 'pt-br' } }
		);

		await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 1 ) ) );

		rerender( { localeSlug: 'es' } );

		await waitFor( () => expect( result.current.items[ 0 ] ).toMatchObject( postKey( 2 ) ) );
		expect( result.current.items ).toHaveLength( 1 );
		expect( nock.isDone() ).toBe( true );
	} );
} );
