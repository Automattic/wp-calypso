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

const testDispatch = ( reduxStore, done, testCallNumber ) => {
	let calls = 0;
	return action => {
		reduxStore.dispatch( action );
		calls++;
		if ( ! testCallNumber || testCallNumber === calls ) {
			done( action );
		}
	};
};

describe( 'WPorg Data Actions', () => {
	let store;

	beforeEach( () => {
		wporg.reset();
		store = createStore( reducer, applyMiddleware( thunk ) );
	} );

	test( 'Actions should have method fetchPluginData', () => {
		expect( fetchPluginData ).toBeInstanceOf( Function );
	} );

	test( 'FetchPluginData action should make a request', done => {
		fetchPluginData( 'test' )(
			testDispatch(
				store,
				function() {
					expect( wporg.getActivity().fetchPluginInformationCalls ).toBe( 1 );
					done();
				},
				2
			),
			store.getState
		);
	} );

	test( "FetchPluginData action shouldn't return an error", done => {
		fetchPluginData( 'test' )(
			testDispatch(
				store,
				function( action ) {
					done( action.error );
				},
				2
			),
			store.getState
		);
	} );

	test( 'FetchPluginData action should return a plugin', done => {
		fetchPluginData( 'test' )(
			testDispatch(
				store,
				function( action ) {
					expect( action.data.slug ).toBe( 'test' );
					done();
				},
				2
			),
			store.getState
		);
	} );

	test( "FetchPluginData action should not make another request if there's already one in progress", () => {
		store.dispatch( fetchPluginData( 'test' ) );
		store.dispatch( fetchPluginData( 'test' ) );
		expect( wporg.getActivity().fetchPluginInformationCalls ).toBe( 1 );
	} );
} );
