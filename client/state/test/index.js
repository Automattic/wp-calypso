/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createReduxStore } from '../';
import currentUser from 'state/current-user/reducer';
import { useSandbox } from 'test/helpers/use-sinon';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

/* eslint-disable jest/no-focused-tests */
describe.only( 'index', () => {
	// @TODO Do not merge me
	describe.only( 'FAIL', () => {
		test.only( 'FAIL', () => {
			global.expect( true ).toBe( false );
		} );
	} );

	describe( 'createReduxStore', () => {
		test( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			expect( reduxStoreNoArgs ).to.be.an( 'object' );
			expect( reduxStoreWithEmptyState ).to.eql( reduxStoreNoArgs );
		} );

		test( 'should return same state on unhandled action', () => {
			// If you're here investigating why tests are failing, you should
			// ensure that your reducer is not returning a new state object if
			// it's not handling the action (i.e. that nothing has changed)
			const store = createReduxStore();
			const originalState = store.getState();

			store.dispatch( { type: '__GARBAGE' } );

			expect( store.getState() ).to.equal( originalState );
		} );

		test( 'is instantiated with initialState', () => {
			const user = { ID: 1234, display_name: 'test user', username: 'testuser' };
			const initialState = {
				currentUser: { id: 1234 },
				users: { items: { 1234: user } },
			};
			const reduxStoreWithCurrentUser = createReduxStore( initialState ).getState();
			expect( reduxStoreWithCurrentUser.currentUser ).to.eql( currentUser( { id: 1234 }, {} ) );
			expect( Object.keys( reduxStoreWithCurrentUser.users.items ).length ).to.eql( 1 );
			expect( reduxStoreWithCurrentUser.users.items[ 1234 ] ).to.eql( user );
		} );

		describe( 'invalid data', () => {
			useSandbox( sandbox => {
				sandbox.stub( console, 'error' );
			} );

			test( 'ignores non-existent keys', () => {
				// eslint-disable-next-line no-console
				expect( console.error.calledOnce ).to.eql( false );
				const reduxStoreNoArgs = createReduxStore().getState();
				const reduxStoreBadData = createReduxStore( { some: { bad: { stuff: true } } } ).getState();
				expect( reduxStoreBadData ).to.eql( reduxStoreNoArgs );
				// eslint-disable-next-line no-console
				expect( console.error.calledOnce ).to.eql( true );
			} );
		} );
	} );
} );
