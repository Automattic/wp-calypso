import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import * as wporg from 'calypso/lib/wporg';
import { combineReducers } from 'calypso/state/utils';
import { fetchPluginData, fetchPluginsList } from '../actions';
import wporgReducer from '../reducer';

jest.mock( 'calypso/lib/wporg', () => ( {
	fetchPluginInformation: jest.fn( ( slug ) => Promise.resolve( { slug } ) ),
	fetchPluginsList: jest.fn( () => Promise.resolve( [ { slug: 'test-plugin' } ] ) ),
} ) );

const reducer = combineReducers( {
	plugins: combineReducers( {
		wporg: wporgReducer,
	} ),
} );

// Redux middleware that wraps the `store.dispatch` method with a Jest spy
const dispatchSpy = () => jest.fn;

describe( 'WPorg Data Actions', () => {
	let store;

	beforeEach( () => {
		jest.clearAllMocks();
		store = createStore( reducer, applyMiddleware( dispatchSpy, thunk ) );
	} );

	test( 'Actions should have method fetchPluginData', () => {
		expect( fetchPluginData ).toBeInstanceOf( Function );
	} );

	test( 'FetchPluginData action should make a request', async () => {
		await store.dispatch( fetchPluginData( 'test' ) );
		expect( store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( wporg.fetchPluginInformation ).toHaveBeenCalledTimes( 1 );
	} );

	test( "FetchPluginData action shouldn't return an error", async () => {
		await store.dispatch( fetchPluginData( 'test' ) );
		expect( store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( store.dispatch ).toHaveBeenLastCalledWith(
			expect.not.objectContaining( { error: expect.anything() } )
		);
	} );

	test( 'FetchPluginData action should return a plugin', async () => {
		await store.dispatch( fetchPluginData( 'test' ) );
		expect( store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( store.dispatch ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				data: expect.objectContaining( {
					slug: 'test',
				} ),
			} )
		);
	} );

	test( "FetchPluginData action should not make another request if there's already one in progress", () => {
		// issue a second request immediately after the first one (while it's still in progress)
		const request1 = store.dispatch( fetchPluginData( 'test' ) );
		const request2 = store.dispatch( fetchPluginData( 'test' ) );
		// just one fetch should have been issued
		expect( wporg.fetchPluginInformation ).toHaveBeenCalledTimes( 1 );
		// wait for all requests to finish before finishing the test
		return Promise.all( [ request1, request2 ] );
	} );

	test( 'Actions should have method fetchPluginList', () => {
		expect( fetchPluginsList ).toBeInstanceOf( Function );
	} );

	test( 'FetchPluginList action should dispatch 3 actions and make a request', async () => {
		await store.dispatch( fetchPluginsList( 'new', 1, undefined ) );
		expect( store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( wporg.fetchPluginsList ).toHaveBeenCalledTimes( 1 );
	} );

	test( "FetchPluginList action shouldn't return an error", async () => {
		await store.dispatch( fetchPluginsList( 'new', 1, undefined ) );
		expect( store.dispatch ).toHaveBeenLastCalledWith(
			expect.not.objectContaining( { error: expect.anything() } )
		);
	} );

	test( 'FetchPluginList action should return a plugin list', async () => {
		await store.dispatch( fetchPluginsList( 'new', 1, undefined ) );
		expect( store.dispatch ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				category: 'new',
			} )
		);
	} );

	test( 'FetchPluginList action should return plugins for search term', async () => {
		await store.dispatch( fetchPluginsList( undefined, 1, 'woocommerce' ) );
		expect( store.dispatch ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				searchTerm: 'woocommerce',
			} )
		);
	} );

	test( "FetchPluginList action should not make another request if there's already one in progress", () => {
		// issue a second request immediately after the first one (while it's still in progress)
		const request1 = store.dispatch( fetchPluginsList( 'new', 1, undefined ) );
		const request2 = store.dispatch( fetchPluginsList( 'new', 1, undefined ) );
		// just one fetch should have been issued
		expect( wporg.fetchPluginsList ).toHaveBeenCalledTimes( 1 );
		// wait for all requests to finish before finishing the test
		return Promise.all( [ request1, request2 ] );
	} );
} );
