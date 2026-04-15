/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { createStore } from 'redux';
import { READER_LISTS_RECEIVE } from 'calypso/state/reader/action-types';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryReaderLists from '../index';

function createTestStore() {
	const actions: Array< { type: string; [ key: string ]: unknown } > = [];
	const store = createStore( ( state = {} ) => state );
	const originalDispatch = store.dispatch;
	store.dispatch = ( action: any ) => {
		actions.push( action );
		return originalDispatch( action );
	};
	return { store, actions };
}

describe( 'QueryReaderLists', () => {
	beforeEach( () => {
		nock.disableNetConnect();
	} );

	afterEach( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	it( 'dispatches receiveLists when the query resolves', async () => {
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

		const { store, actions } = createTestStore();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );

		renderWithProvider( <QueryReaderLists />, { store, queryClient } );

		await waitFor( () => {
			const receiveAction = actions.find( ( a ) => a.type === READER_LISTS_RECEIVE );
			expect( receiveAction ).toBeDefined();
			expect( receiveAction?.lists ).toEqual( lists );
		} );
	} );

	it( 'renders nothing', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists' )
			.query( { create_recommended_blogs_list: 'true' } )
			.reply( 200, { lists: [] } );

		const { store } = createTestStore();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );

		const { container } = renderWithProvider( <QueryReaderLists />, { store, queryClient } );
		expect( container.innerHTML ).toBe( '' );
	} );
} );
