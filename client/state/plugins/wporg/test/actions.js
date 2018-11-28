/** @format */
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
import wporg from 'lib/wporg';
jest.mock( 'lib/wporg', () => require( './mocks/lib/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: cb => cb,
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
		wporg.reset();
		store = createStore( reducer, applyMiddleware( dispatchSpy, thunk ) );
	} );

	test( 'Actions should have method fetchPluginData', () => {
		expect( fetchPluginData ).toBeInstanceOf( Function );
	} );

	test( 'FetchPluginData action should make a request', async () => {
		await store.dispatch( fetchPluginData( 'test' ) );
		expect( store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( wporg.getActivity().fetchPluginInformationCalls ).toBe( 1 );
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
		store.dispatch( fetchPluginData( 'test' ) );
		store.dispatch( fetchPluginData( 'test' ) );
		expect( wporg.getActivity().fetchPluginInformationCalls ).toBe( 1 );
	} );
} );
