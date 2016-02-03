/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { initialState, query } from '../reducer';

describe( 'themes-last-query reducer', () => {
	describe( 'persistence', () => {
		it( 'persists state and converts to a plain JS object', () => {
			const jsObject = Object.freeze( {
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
			expect( persistedState ).to.eql( jsObject );
		} );
		it( 'loads valid persisted state and converts to immutable.js object', () => {
			const jsObject = Object.freeze( {
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
			expect( state ).to.eql( query( fromJS( jsObject ) ) );
		} );

		it.skip( 'should ignore loading data with invalid keys ', () => {
			const jsObject = Object.freeze( {
				foobar: [ 'one', 'two', 'three' ],
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

		it.skip( 'should ignore loading data with invalid values ', () => {
			const jsObject = Object.freeze( {
				list: [ 'one', 'two', 'three' ],
				nextId: 2,
				query: {
					search: null,
					perPage: 20,
					page: 1,
					tier: 'all',
					id: 5
				},
				queryState: {
					isLastPage: 'wrongvalue',
					isFetchingNextPage: false
				},
				active: 0
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );
	} );
} );
