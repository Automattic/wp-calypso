/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	SERVER_DESERIALIZE
} from 'state/action-types';
import reducer, { initialState, query } from '../reducer';

describe( 'themes-last-query reducer', () => {
	describe( 'persistence', () => {
		it( 'does not persist state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				list: [ 'one', 'two', 'three' ],
				nextId: 2,
				query: {
					search: 'hello',
					perPage: 20,
					page: 1,
					tier: 'all',
					id: 5
				},
				queryState: {
					isLastPage: true,
					isFetchingNextPage: false
				},
				active: 0
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				list: [ 'one', 'two', 'three' ],
				nextId: 2,
				query: {
					search: 'hello',
					perPage: 20,
					page: 1,
					tier: 'all',
					id: 5
				},
				queryState: {
					isLastPage: true,
					isFetchingNextPage: false
				},
				active: 0
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
				list: [ 'one', 'two', 'three' ],
				nextId: 2,
				query: {
					search: 'hello',
					perPage: 20,
					page: 1,
					tier: 'all',
					id: 5
				},
				queryState: {
					isLastPage: true,
					isFetchingNextPage: false
				},
				active: 0
			} );
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( query( fromJS( jsObject ) ) );
		} );
	} );
} );
