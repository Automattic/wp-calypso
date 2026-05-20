/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { getCachedReaderPost, upsertReaderPostCache } from 'calypso/reader/data/reader-post-cache';
import { createReaderPostCacheMiddleware } from 'calypso/reader/data/reader-post-cache-middleware';
import readerReducer from 'calypso/state/reader/reducer';
import { useReaderPost } from '../reader-post';
import type { ReadPostKey } from '@automattic/api-core';
import type { ReactNode } from 'react';

const buildStore = ( queryClient: QueryClient, preloadedState?: { reader?: unknown } ) =>
	createStore(
		combineReducers( { reader: readerReducer } ),
		preloadedState as never,
		applyMiddleware(
			thunkMiddleware,
			createReaderPostCacheMiddleware( () => queryClient )
		)
	);

const buildQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

const renderReaderPost = (
	postKey: Partial< ReadPostKey > | null | undefined,
	preloadedState?: { reader?: unknown },
	queryClient = buildQueryClient()
) => {
	const store = buildStore( queryClient, preloadedState );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);

	return {
		...renderHook( () => useReaderPost( postKey ), { wrapper } ),
		store,
		queryClient,
	};
};

describe( 'useReaderPost', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fetches a blog post and exposes it through the canonical post cache', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2' } );

		const { queryClient } = renderReaderPost( { blogId: 1, postId: 2 } );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				ID: 2,
				site_ID: 1,
			} );
		} );
	} );

	it( 'writes successful fetches into the canonical post cache', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, {
				ID: 2,
				site_ID: 1,
				global_ID: 'global-2',
				content: '<p>full</p>',
			} );

		const { queryClient } = renderReaderPost( { blogId: 1, postId: 2 } );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				ID: 2,
				site_ID: 1,
				content: '<p>full</p>',
			} );
		} );
	} );

	it( 'fetches a feed post via the v1.2 endpoint', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/feed/3/posts/4' )
			.query( true )
			.reply( 200, { ID: 4, feed_ID: 3, feed_item_ID: 4, global_ID: 'global-feed-4' } );

		const { queryClient } = renderReaderPost( { feedId: 3, postId: 4 } );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { feedId: 3, postId: 4 } ) ).toMatchObject( {
				ID: 4,
				feed_ID: 3,
				feed_item_ID: 4,
			} );
		} );
	} );

	it( 'writes a synthetic error post when the request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const { queryClient } = renderReaderPost( { blogId: 1, postId: 2 } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				ID: 2,
				site_ID: 1,
				global_ID: 'error-1-2',
				is_error: true,
			} );
		} );
	} );

	it( 'reuses the same global_ID across re-renders so error posts do not accumulate', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const queryClient = buildQueryClient();
		const store = buildStore( queryClient );
		const wrapper = ( { children }: { children: ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		);

		const { rerender } = renderHook( ( { postKey } ) => useReaderPost( postKey ), {
			initialProps: { postKey: { blogId: 1, postId: 2 } },
			wrapper,
		} );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				is_error: true,
			} );
		} );

		// Re-render with a new object literal of the same shape. The deterministic
		// global_ID overwrites the same reducer entry instead of accumulating dupes.
		rerender( { postKey: { blogId: 1, postId: 2 } } );
		rerender( { postKey: { blogId: 1, postId: 2 } } );

		expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
			global_ID: 'error-1-2',
			is_error: true,
		} );
	} );

	it( 'does not fetch when postKey is incomplete', () => {
		// nock.disableNetConnect would throw on any unexpected request.
		const { queryClient } = renderReaderPost( { blogId: 1 } as never );
		expect( getCachedReaderPost( queryClient, { blogId: 1 } as never ) ).toBeNull();
	} );

	it( 'exposes loading state while fetching a missing post', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>full</p>' } );

		const { result } = renderReaderPost( { blogId: 1, postId: 2 } );

		expect( result.current ).toMatchObject( {
			isLoading: true,
			isError: false,
		} );
		expect( result.current.data ).toBeUndefined();

		await waitFor( () => {
			expect( result.current ).toMatchObject( {
				data: { ID: 2, site_ID: 1, content: '<p>full</p>' },
				isLoading: false,
				isError: false,
			} );
		} );
	} );

	it( 'exposes error state when fetching a missing post fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const { result } = renderReaderPost( { blogId: 1, postId: 2 } );

		await waitFor( () => {
			expect( result.current ).toMatchObject( {
				data: { ID: 2, site_ID: 1, is_error: true },
				isLoading: false,
				isError: true,
			} );
			expect( result.current.error ).toBeTruthy();
		} );
	} );

	it( 'skips the network call when the post is already in the canonical post cache', () => {
		// No nock scope: any request would throw because of disableNetConnect.
		const cached = { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>cached</p>' };
		const queryClient = buildQueryClient();
		upsertReaderPostCache( queryClient, [ cached ] );

		const { result } = renderReaderPost( { blogId: 1, postId: 2 }, undefined, queryClient );

		expect( result.current.data ).toMatchObject( cached );
	} );

	it( 'fetches when the post only exists in legacy Redux post state', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>full</p>' } );

		const { queryClient } = renderReaderPost(
			{ blogId: 1, postId: 2 },
			{
				reader: {
					posts: {
						items: {
							'global-2': { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>redux</p>' },
						},
						seen: {},
					},
				},
			}
		);

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				content: '<p>full</p>',
			} );
		} );
	} );

	it( 'still fetches when the cached post is in the minimal state', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', title: 'full' } );

		const queryClient = buildQueryClient();
		upsertReaderPostCache( queryClient, [
			{ ID: 2, site_ID: 1, global_ID: 'global-2', _state: 'minimal' },
		] );
		renderReaderPost( { blogId: 1, postId: 2 }, undefined, queryClient );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				title: 'full',
			} );
		} );
	} );

	it( 'still fetches when cached post lacks renderable content', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>full</p>' } );

		const queryClient = buildQueryClient();
		upsertReaderPostCache( queryClient, [
			{ ID: 2, site_ID: 1, global_ID: 'global-2', title: 'from stream' },
		] );
		renderReaderPost( { blogId: 1, postId: 2 }, undefined, queryClient );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
				content: '<p>full</p>',
			} );
		} );
	} );
} );
