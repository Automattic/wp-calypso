/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { STORED_CARDS_FROM_API } from './fixture';
import { STORED_CARDS_ADD_COMPLETED, STORED_CARDS_FETCH, STORED_CARDS_FETCH_COMPLETED, STORED_CARDS_FETCH_FAILED, STORED_CARDS_DELETE, STORED_CARDS_DELETE_COMPLETED, STORED_CARDS_DELETE_FAILED, SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'items', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: false
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( reducer( undefined, { type: STORED_CARDS_FETCH } ) ).to.be.eql( {
			items: [],
			isFetching: true,
			isDeleting: false,
			hasLoadedFromServer: false
		} );
	} );

	it( 'should return an object with the list of stored cards when fetching completed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_COMPLETED,
			list: STORED_CARDS_FROM_API
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: true
		} );
	} );

	it( 'should return an object with an empty list of stored cards when fetching failed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_FAILED
		} );

		expect( state ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: false
		} );
	} );

	it( 'should add a stored card to the list if the stored card add request succeeded', () => {
		const state = reducer( deepFreeze( {
			items: [ STORED_CARDS_FROM_API[ 0 ] ],
			isFetching: false,
			hasLoadedFromServer: true
		} ), {
			type: STORED_CARDS_ADD_COMPLETED,
			item: STORED_CARDS_FROM_API[ 1 ]
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: true
		} );
	} );

	it( 'should keep the current state and enable isDeleting when requesting a stored card deletion', () => {
		const state = reducer( deepFreeze( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: true
		} ), {
			type: STORED_CARDS_DELETE,
			card: STORED_CARDS_FROM_API[ 0 ]
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: true,
			hasLoadedFromServer: true
		} );
	} );

	it( 'should remove a stored card from the list if the stored card deletion request succeeded', () => {
		const state = reducer( deepFreeze( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: true,
			hasLoadedFromServer: true
		} ), {
			type: STORED_CARDS_DELETE_COMPLETED,
			card: STORED_CARDS_FROM_API[ 0 ]
		} );

		expect( state ).to.be.eql( {
			items: [ STORED_CARDS_FROM_API[ 1 ] ],
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: true
		} );
	} );

	it( 'should not change the list of items if the stored card deletion request failed', () => {
		const state = reducer( deepFreeze( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: true,
			hasLoadedFromServer: true
		} ), {
			type: STORED_CARDS_DELETE_FAILED
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: false,
			hasLoadedFromServer: true
		} );
	} );

	describe( 'persistence', () => {
		it( 'should persist state', () => {
			const originalState = deepFreeze( STORED_CARDS_FROM_API );

			const state = items( originalState, { type: SERIALIZE } );

			expect( state ).to.eql( originalState );
		} );

		it( 'should load valid persisted state', () => {
			const originalState = deepFreeze( STORED_CARDS_FROM_API );

			const state = items( originalState, { type: DESERIALIZE } );

			expect( state ).to.eql( originalState );
		} );

		it( 'should load default state when schema does not match', () => {
			const originalState = deepFreeze( [ {
				card_type: 'amex',
				payment_partner: 'moneypress',
				email: 1234
			} ] );

			const state = items( originalState, { type: DESERIALIZE } );

			expect( state ).to.eql( [] );
		} );
	} );
} );
