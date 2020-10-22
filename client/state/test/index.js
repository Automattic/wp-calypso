/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { createReduxStore } from '../';
import currentUser from 'calypso/state/current-user/reducer';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'index', () => {
	describe( 'createReduxStore', () => {
		test( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			expect( reduxStoreNoArgs ).toBeInstanceOf( Object );
			expect( reduxStoreWithEmptyState ).toEqual( reduxStoreNoArgs );
		} );

		test( 'should return same state on unhandled action', () => {
			// If you're here investigating why tests are failing, you should
			// ensure that your reducer is not returning a new state object if
			// it's not handling the action (i.e. that nothing has changed)
			const store = createReduxStore();
			const originalState = store.getState();

			store.dispatch( { type: '__GARBAGE' } );

			expect( store.getState() ).toBe( originalState );
		} );

		test( 'is instantiated with initialState', () => {
			const user = { ID: 1234, display_name: 'test user', username: 'testuser' };
			const initialState = {
				currentUser: { id: 1234 },
				users: { items: { 1234: user } },
			};
			const reduxStoreWithCurrentUser = createReduxStore( initialState ).getState();
			expect( reduxStoreWithCurrentUser.currentUser ).toEqual( currentUser( { id: 1234 }, {} ) );
			expect( Object.keys( reduxStoreWithCurrentUser.users.items ) ).toHaveLength( 1 );
			expect( reduxStoreWithCurrentUser.users.items[ 1234 ] ).toEqual( user );
		} );

		describe( 'invalid data', () => {
			test( 'ignores non-existent keys', () => {
				const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( noop );
				expect( consoleErrorSpy ).not.toHaveBeenCalled();
				const reduxStoreNoArgs = createReduxStore().getState();
				const reduxStoreBadData = createReduxStore( { some: { bad: { stuff: true } } } ).getState();
				expect( reduxStoreBadData ).toEqual( reduxStoreNoArgs );
				expect( consoleErrorSpy ).toHaveBeenCalledTimes( 1 );
				consoleErrorSpy.mockRestore();
			} );
		} );
	} );
} );
