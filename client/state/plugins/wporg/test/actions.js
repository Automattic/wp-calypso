/**
 * External dependencies
 */
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import { fetchPluginData } from '../actions';
import wporgReducer from '../reducer';
import { combineReducers } from 'state/utils';
import * as wporg from 'lib/wporg';

jest.mock( 'lib/wporg', () => ( {
	fetchPluginInformation: jest.fn( ( slug ) => Promise.resolve( { slug } ) ),
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
} );
