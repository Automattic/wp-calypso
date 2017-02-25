/* eslint-disable no-console */

/**
 * External dependencies
 */
import chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import { createReduxStore } from '../';
import currentUser from 'state/current-user/reducer';

const should = chai.should();

describe( 'index', () => {
	describe( 'addReducer', () => {
		const name = 'myReducer';
		const func = ( state ) => state || {};

		it( 'should add and remove a reducer by name', () => {
			const store = createReduxStore();

			should.not.exist( store.getReducers()[ name ] );

			store.addReducer( name, func );
			should.exist( store.getReducers()[ name ] );

			store.removeReducer( name );
			should.not.exist( store.getReducers()[ name ] );
		} );

		it( 'should throw when trying to add a reducer with an existing name', () => {
			const store = createReduxStore();

			const addFunc = () => {
				store.addReducer( name, func );
			};

			expect( addFunc ).to.not.throw( Error );
			should.exist( store.getReducers()[ name ] );

			expect( addFunc ).to.throw( Error );
		} );
	} );

	describe( 'createReduxStore', () => {
		it( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			expect( reduxStoreNoArgs ).to.be.an( 'object' );
			expect( reduxStoreWithEmptyState ).to.eql( reduxStoreNoArgs );
		} );

		it( 'should return same state on unhandled action', () => {
			// If you're here investigating why tests are failing, you should
			// ensure that your reducer is not returning a new state object if
			// it's not handling the action (i.e. that nothing has changed)
			const store = createReduxStore();
			const originalState = store.getState();

			store.dispatch( { type: '__GARBAGE' } );

			expect( store.getState() ).to.equal( originalState );
		} );

		it( 'is instantiated with initialState', () => {
			const user = { ID: 1234, display_name: 'test user', username: 'testuser' };
			const initialState = {
				currentUser: { id: 1234 },
				users: { items: { 1234: user } }
			};
			const reduxStoreWithCurrentUser = createReduxStore( initialState ).getState();
			expect( reduxStoreWithCurrentUser.currentUser ).to.eql( currentUser( { id: 1234 }, {} ) );
			expect( Object.keys( reduxStoreWithCurrentUser.users.items ).length ).to.eql( 1 );
			expect( reduxStoreWithCurrentUser.users.items[ 1234 ] ).to.eql( user );
		} );

		describe( 'invalid data', () => {
			useSandbox( ( sandbox ) => {
				sandbox.stub( console, 'error' );
			} );

			it( 'ignores non-existent keys', () => {
				expect( console.error.calledOnce ).to.eql( false );
				const reduxStoreNoArgs = createReduxStore().getState();
				const reduxStoreBadData = createReduxStore(
					{ some: { bad: { stuff: true } } }
				).getState();
				expect( reduxStoreBadData ).to.eql( reduxStoreNoArgs );
				expect( console.error.calledOnce ).to.eql( true );
			} );
		} );
	} );
} );
