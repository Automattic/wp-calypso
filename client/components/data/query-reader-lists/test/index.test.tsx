/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import readerReducer from 'calypso/state/reader/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryReaderLists from '../index';

function createTestStore() {
	return createStore(
		combineReducers( { reader: readerReducer } ),
		applyMiddleware( thunkMiddleware )
	);
}

function createQueryClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
}

describe( 'QueryReaderLists', () => {
	beforeEach( () => nock.disableNetConnect() );
	afterEach( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	it( 'syncs subscribed lists to Redux when the query resolves', async () => {
		const lists = [
			{
				ID: 1,
				title: 'My List',
				slug: 'my-list',
				owner: 'testuser',
				description: '',
				is_owner: true,
				is_public: false,
			},
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists' )
			.query( { create_recommended_blogs_list: 'true' } )
			.reply( 200, { lists } );

		const store = createTestStore();
		renderWithProvider( <QueryReaderLists />, { store, queryClient: createQueryClient() } );

		await waitFor( () => {
			expect( store.getState().reader.lists.items[ 1 ] ).toEqual( lists[ 0 ] );
		} );
	} );

	it( 'renders nothing', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists' )
			.query( { create_recommended_blogs_list: 'true' } )
			.reply( 200, { lists: [] } );

		const { container } = renderWithProvider( <QueryReaderLists />, {
			store: createTestStore(),
			queryClient: createQueryClient(),
		} );

		expect( container.innerHTML ).toBe( '' );
	} );
} );
