/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { getReaderPostEntity } from 'calypso/reader/data/reader-post-entities';
import { createReaderPostEntitiesMiddleware } from 'calypso/reader/data/reader-post-entities-middleware';
import readerReducer from 'calypso/state/reader/reducer';
import QueryReaderPost from '../index';

const buildStore = ( queryClient: QueryClient, preloadedState?: { reader?: unknown } ) =>
	createStore(
		combineReducers( { reader: readerReducer } ),
		preloadedState as never,
		applyMiddleware(
			thunkMiddleware,
			createReaderPostEntitiesMiddleware( () => queryClient )
		)
	);

const buildQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

const renderBridge = (
	props: Parameters< typeof QueryReaderPost >[ 0 ],
	preloadedState?: { reader?: unknown },
	queryClient = buildQueryClient()
) => {
	const store = buildStore( queryClient, preloadedState );
	const utils = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<QueryReaderPost { ...props } />
			</Provider>
		</QueryClientProvider>
	);
	return { ...utils, store, queryClient };
};

const getReceivedPosts = ( store: ReturnType< typeof buildStore > ) =>
	( store.getState() as { reader: { posts: { items: Record< string, unknown > } } } ).reader.posts
		.items;

describe( 'QueryReaderPost', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fetches a blog post and writes it into state.reader.posts', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2' } );

		const { store } = renderBridge( { postKey: { blogId: 1, postId: 2 } } );

		await waitFor( () => {
			expect( getReceivedPosts( store ) ).toHaveProperty( 'global-2' );
		} );
	} );

	it( 'writes successful fetches into the canonical post entity cache', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, {
				ID: 2,
				site_ID: 1,
				global_ID: 'global-2',
				content: '<p>full</p>',
			} );

		const { queryClient } = renderBridge( { postKey: { blogId: 1, postId: 2 } } );

		await waitFor( () => {
			expect( getReaderPostEntity( queryClient, { blogId: 1, postId: 2 } ) ).toMatchObject( {
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

		const { store, queryClient } = renderBridge( { postKey: { feedId: 3, postId: 4 } } );

		await waitFor( () => {
			expect( getReceivedPosts( store ) ).toHaveProperty( 'global-feed-4' );
			expect( getReaderPostEntity( queryClient, { feedId: 3, postId: 4 } ) ).toMatchObject( {
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

		const { store } = renderBridge( { postKey: { blogId: 1, postId: 2 } } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		await waitFor( () => {
			const items = getReceivedPosts( store );
			const errorPosts = Object.values( items ).filter(
				( p ) => ( p as { is_error?: boolean } ).is_error
			) as Array< { ID: number; site_ID: number; global_ID: string; is_error: boolean } >;
			expect( errorPosts ).toHaveLength( 1 );
			expect( errorPosts[ 0 ].ID ).toBe( 2 );
			expect( errorPosts[ 0 ].site_ID ).toBe( 1 );
			expect( errorPosts[ 0 ].global_ID ).toBe( 'error-1-2' );
		} );
	} );

	it( 'reuses the same global_ID across re-renders so error posts do not accumulate', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const queryClient = buildQueryClient();
		const store = buildStore( queryClient );

		const Wrapper = ( { postKey }: { postKey: { blogId: number; postId: number } } ) => (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<QueryReaderPost postKey={ postKey } />
				</Provider>
			</QueryClientProvider>
		);

		const { rerender } = render( <Wrapper postKey={ { blogId: 1, postId: 2 } } /> );

		await waitFor( () => {
			const errorPosts = Object.values( getReceivedPosts( store ) ).filter(
				( p ) => ( p as { is_error?: boolean } ).is_error
			);
			expect( errorPosts ).toHaveLength( 1 );
		} );

		// Re-render with a new object literal of the same shape — the effect
		// re-fires, but the deterministic global_ID overwrites the same entry.
		rerender( <Wrapper postKey={ { blogId: 1, postId: 2 } } /> );
		rerender( <Wrapper postKey={ { blogId: 1, postId: 2 } } /> );

		const errorPosts = Object.values( getReceivedPosts( store ) ).filter(
			( p ) => ( p as { is_error?: boolean } ).is_error
		);
		expect( errorPosts ).toHaveLength( 1 );
	} );

	it( 'does not fetch when postKey is incomplete', () => {
		// nock.disableNetConnect would throw on any unexpected request.
		const { store } = renderBridge( { postKey: { blogId: 1 } as never } );
		expect( getReceivedPosts( store ) ).toEqual( {} );
	} );

	it( 'skips the network call when the post is already in Redux', () => {
		// No nock scope: any request would throw because of disableNetConnect.
		const cached = { ID: 2, site_ID: 1, global_ID: 'global-2' };
		const { store } = renderBridge(
			{ postKey: { blogId: 1, postId: 2 } },
			{ reader: { posts: { items: { 'global-2': cached }, seen: {} } } }
		);
		expect( getReceivedPosts( store ) ).toEqual( { 'global-2': cached } );
	} );

	it( 'still fetches when the cached post is in the minimal state', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', title: 'full' } );

		const { store } = renderBridge(
			{ postKey: { blogId: 1, postId: 2 } },
			{
				reader: {
					posts: {
						items: {
							'global-2': { ID: 2, site_ID: 1, global_ID: 'global-2', _state: 'minimal' },
						},
						seen: {},
					},
				},
			}
		);

		await waitFor( () => {
			expect( getReceivedPosts( store ) ).toMatchObject( {
				'global-2': { title: 'full' },
			} );
		} );
	} );

	it( 'still fetches when cached post lacks renderable content', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/2' )
			.query( true )
			.reply( 200, { ID: 2, site_ID: 1, global_ID: 'global-2', content: '<p>full</p>' } );

		const { store } = renderBridge(
			{ postKey: { blogId: 1, postId: 2 } },
			{
				reader: {
					posts: {
						items: {
							'global-2': { ID: 2, site_ID: 1, global_ID: 'global-2', title: 'from stream' },
						},
						seen: {},
					},
				},
			}
		);

		await waitFor( () => {
			expect( getReceivedPosts( store ) ).toMatchObject( {
				'global-2': { content: '<p>full</p>' },
			} );
		} );
	} );
} );
