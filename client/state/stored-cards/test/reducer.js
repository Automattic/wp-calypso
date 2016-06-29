/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED
} from 'state/action-types';
import reducer from '../reducer';
import { STORED_CARDS_FROM_API, STORED_CARDS } from './fixture';

describe( 'items', () => {
	it( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: false
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( reducer( undefined, { type: STORED_CARDS_FETCH } ) ).to.be.eql( {
			items: [],
			isFetching: true,
			isDeleting: false
		} );
	} );

	it( 'should return an object with the list of stored cards when fetching completed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_COMPLETED,
			list: STORED_CARDS_FROM_API
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: false
		} );
	} );

	it( 'should return an object with an empty list of stored cards when fetching failed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_FAILED
		} );

		expect( state ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: false
		} );
	} );

	it( 'should keep the current state and enable isDeleting when requesting a stored card deletion', () => {
		const state = reducer( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: false
		}, {
			type: STORED_CARDS_DELETE,
			card: STORED_CARDS[ 0 ]
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: true
		} );
	} );

	it( 'should remove a stored card from the list if the stored card deletion request succeeded', () => {
		const state = reducer( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: true
		}, {
			type: STORED_CARDS_DELETE_COMPLETED,
			card: STORED_CARDS[ 0 ]
		} );

		expect( state ).to.be.eql( {
			items: [ STORED_CARDS[ 1 ] ],
			isFetching: false,
			isDeleting: false
		} );
	} );

	it( 'should not change the list of items if the stored card deletion request failed', () => {
		const state = reducer( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: true
		}, {
			type: STORED_CARDS_DELETE_FAILED
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS,
			isFetching: false,
			isDeleting: false
		} );
	} );
} );
