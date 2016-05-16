/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { createReduxStore } from '../';
import currentUser from 'state/current-user/reducer';

describe( 'index', () => {
	describe( 'createReduxStore', () => {
		it( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			expect( reduxStoreNoArgs ).to.be.an( 'object' );
			expect( reduxStoreWithEmptyState ).to.eql( reduxStoreNoArgs );
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
			before( () => {
				sinon.stub( console, 'error' );
			} );

			after( () => {
				console.error.restore();
			} );

			it( 'ignores non-existent keys', () => {
				expect( console.error.calledOnce ).to.eql( false );
				const reduxStoreNoArgs = createReduxStore().getState();
				const reduxStoreBadData = createReduxStore( { some: { bad: { stuff: true } } } ).getState();
				expect( reduxStoreBadData ).to.eql( reduxStoreNoArgs );
				expect( console.error.calledOnce ).to.eql( true );
			} );
		} );
	} );
} );
