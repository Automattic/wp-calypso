/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { upsertPostCache } from 'calypso/reader/data/post-cache';
import { createPostCacheMiddleware } from 'calypso/reader/data/post-cache-middleware';
import readerReducer from 'calypso/state/reader/reducer';
import EngagementBar from '../engagement-bar';
import type { ReactNode } from 'react';

jest.mock( 'calypso/blocks/reader-post-actions', () => ( {
	__esModule: true,
	default: ( { post }: { post: { title?: string } } ) => (
		<div data-testid="reader-post-actions">{ post.title }</div>
	),
} ) );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeStore = ( queryClient: QueryClient ) =>
	createStore(
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware(
			thunkMiddleware,
			createPostCacheMiddleware( () => queryClient )
		)
	);

const renderWithProviders = ( queryClient: QueryClient, children: ReactNode ) => {
	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ makeStore( queryClient ) }>{ children }</Provider>
		</QueryClientProvider>
	);
};

describe( 'EngagementBar', () => {
	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders actions from the canonical Reader post cache', () => {
		const queryClient = makeQueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-1',
				title: 'Cached post',
			},
		] );

		renderWithProviders( queryClient, <EngagementBar feedId={ 200 } postId={ 300 } /> );

		expect( screen.getByTestId( 'reader-post-actions' ) ).toHaveTextContent( 'Cached post' );
	} );

	it( 'loads the post when it is missing from the canonical post cache', async () => {
		const queryClient = makeQueryClient();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/feed/200/posts/300' )
			.query( true )
			.reply( 200, {
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-1',
				title: 'Fetched post',
			} );

		renderWithProviders( queryClient, <EngagementBar feedId={ 200 } postId={ 300 } /> );

		await waitFor( () =>
			expect( screen.getByTestId( 'reader-post-actions' ) ).toHaveTextContent( 'Fetched post' )
		);
	} );
} );
