/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

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
import { STORED_CARDS_FROM_API } from './fixture';

describe( 'items', () => {
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
} );
