/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import readerReducer from 'calypso/state/reader/reducer';
import QueryReaderPost from '../index';

const buildStore = () =>
	createStore( combineReducers( { reader: readerReducer } ), applyMiddleware( thunkMiddleware ) );

const buildQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

const renderBridge = ( props: Parameters< typeof QueryReaderPost >[ 0 ] ) => {
	const store = buildStore();
	const queryClient = buildQueryClient();
	const utils = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<QueryReaderPost { ...props } />
			</Provider>
		</QueryClientProvider>
	);
	return { ...utils, store };
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

	it( 'fetches a feed post via the v1.2 endpoint', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/feed/3/posts/4' )
			.query( true )
			.reply( 200, { ID: 4, feed_ID: 3, feed_item_ID: 4, global_ID: 'global-feed-4' } );

		const { store } = renderBridge( { postKey: { feedId: 3, postId: 4 } } );

		await waitFor( () => {
			expect( getReceivedPosts( store ) ).toHaveProperty( 'global-feed-4' );
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
			const errorPost = Object.values( items ).find(
				( p ) => ( p as { is_error?: boolean } ).is_error
			) as { ID: number; site_ID: number; is_error: boolean } | undefined;
			expect( errorPost ).toBeDefined();
			expect( errorPost?.ID ).toBe( 2 );
			expect( errorPost?.site_ID ).toBe( 1 );
		} );
	} );

	it( 'does not fetch when postKey is incomplete', () => {
		// nock.disableNetConnect would throw on any unexpected request.
		const { store } = renderBridge( { postKey: { blogId: 1 } as never } );
		expect( getReceivedPosts( store ) ).toEqual( {} );
	} );
} );
