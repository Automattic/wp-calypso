/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_LISTS_RECEIVE,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE
} from 'state/action-types';

import {
	items,
	updatedLists,
	missingLists,
	subscribedLists,
} from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index lists by ID', () => {
			const state = items( null, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World' },
					{ ID: 413, title: 'Mangos and feijoas' }
				]
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' }
			} );
		} );

		it( 'should accumulate lists', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: READER_LISTS_RECEIVE,
				lists: [ { ID: 413, title: 'Mangos and feijoas' } ]
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' }
			} );
		} );

		it( 'should update a list title', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_TITLE,
				listId: 841,
				title: 'Bananas'
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas' }
			} );
		} );

		it( 'should update a list description', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Bananas' }
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_DESCRIPTION,
				listId: 841,
				title: 'Bananas',
				description: 'This is a list about fruit'
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas', description: 'This is a list about fruit' }
			} );
		} );
	} );

	describe( '#updatedLists()', () => {
		it( 'should default to an empty array', () => {
			const state = updatedLists( undefined, {} );
			expect( state ).to.eql( [] );
		} );

		it( 'should add a list ID when a list is updated', () => {
			const state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World'
					}
				}
			} );

			expect( state ).to.eql( [ 841 ] );
		} );

		it( 'should remove a list ID when a notice is dismissed', () => {
			let state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World'
					}
				}
			} );

			expect( state ).to.eql( [ 841 ] );

			state = updatedLists( null, {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 841
			} );

			expect( state ).to.eql( [] );
		} );
	} );

	describe( '#missingLists()', () => {
		it( 'should default to an empty array', () => {
			const state = missingLists( undefined, {} );
			expect( state ).to.eql( [] );
		} );

		it( 'should store new missing lists in the case of a 404', () => {
			const state = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404
				},
				owner: 'lister',
				slug: 'banana'
			} );

			expect( state ).to.eql( [
				{ owner: 'lister', slug: 'banana' }
			] );
		} );

		it( 'should not store new missing lists in the case of a different error', () => {
			const state = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 400
				},
				owner: 'lister',
				slug: 'banana'
			} );

			expect( state ).to.eql( [] );
		} );

		it( 'should remove a missing list if a successful lists response is received', () => {
			const initialState = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404
				},
				owner: 'lister',
				slug: 'banana'
			} );

			expect( initialState ).to.eql( [
				{ owner: 'lister', slug: 'banana' }
			] );

			const state = missingLists( initialState, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' },
					{ ID: 413, title: 'Mangos and feijoas', owner: 'lister', slug: 'mango' }
				]
			} );

			expect( state ).to.eql( [] );
		} );

		it( 'should remove a missing list if a successful single list response is received', () => {
			const initialState = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404
				},
				owner: 'lister',
				slug: 'banana'
			} );

			expect( initialState ).to.eql( [
				{ owner: 'lister', slug: 'banana' }
			] );

			const state = missingLists( initialState, {
				type: READER_LIST_REQUEST_SUCCESS,
				data: {
					list: { ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' }
				}
			} );

			expect( state ).to.eql( [] );
		} );
	} );

	describe( '#subscribedLists', () => {
		it( 'should default to empty', () => {
			expect( subscribedLists( undefined, { type: '@@BAD' } ) ).to.eql( [] );
		} );

		it( 'should pick up the ids of the subscribed lists', () => {
			expect( subscribedLists( deepFreeze( [] ), {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 1 },
					{ ID: 2 }
				]
			} ) ).to.eql( [ 1, 2 ] );
		} );

		it( 'should overwrite existing subs', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect( subscribedLists( initial, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 3 },
					{ ID: 1 }
				]
			} ) ).to.eql( [ 3, 1 ] );
		} );

		it( 'should remove an item on unfollow', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect( subscribedLists( initial, {
				type: READER_LISTS_UNFOLLOW_SUCCESS,
				data: {
					list: { ID: 1 }
				}
			} ) ).to.eql( [ 2 ] );
		} );
	} );
} );
