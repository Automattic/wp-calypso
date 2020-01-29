/**
 * External dependencies
 */
import { expect as chaiExpect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, updatedLists, missingLists, subscribedLists } from '../reducer';
import {
	READER_LISTS_RECEIVE,
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			chaiExpect( state ).to.eql( {} );
		} );

		test( 'should index lists by ID', () => {
			const state = items( null, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World' },
					{ ID: 413, title: 'Mangos and feijoas' },
				],
			} );

			chaiExpect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' },
			} );
		} );

		test( 'should accumulate lists', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' },
			} );
			const state = items( original, {
				type: READER_LISTS_RECEIVE,
				lists: [ { ID: 413, title: 'Mangos and feijoas' } ],
			} );

			chaiExpect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' },
			} );
		} );

		test( 'should update a list title', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' },
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_TITLE,
				listId: 841,
				title: 'Bananas',
			} );

			chaiExpect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas' },
			} );
		} );

		test( 'should update a list description', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Bananas' },
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_DESCRIPTION,
				listId: 841,
				title: 'Bananas',
				description: 'This is a list about fruit',
			} );

			chaiExpect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas', description: 'This is a list about fruit' },
			} );
		} );
	} );

	describe( '#updatedLists()', () => {
		test( 'should default to an empty array', () => {
			const state = updatedLists( undefined, {} );
			chaiExpect( state ).to.eql( [] );
		} );

		test( 'should add a list ID when a list is updated', () => {
			const state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World',
					},
				},
			} );

			chaiExpect( state ).to.eql( [ 841 ] );
		} );

		test( 'should remove a list ID when a notice is dismissed', () => {
			let state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World',
					},
				},
			} );

			chaiExpect( state ).to.eql( [ 841 ] );

			state = updatedLists( null, {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 841,
			} );

			chaiExpect( state ).to.eql( [] );
		} );
	} );

	describe( '#missingLists()', () => {
		test( 'should default to an empty array', () => {
			const state = missingLists( undefined, {} );
			chaiExpect( state ).to.eql( [] );
		} );

		test( 'should store new missing lists in the case of a 404', () => {
			const state = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404,
				},
				owner: 'lister',
				slug: 'banana',
			} );

			chaiExpect( state ).to.eql( [ { owner: 'lister', slug: 'banana' } ] );
		} );

		test( 'should not store new missing lists in the case of a different error', () => {
			const state = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 400,
				},
				owner: 'lister',
				slug: 'banana',
			} );

			chaiExpect( state ).to.eql( [] );
		} );

		test( 'should remove a missing list if a successful lists response is received', () => {
			const initialState = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404,
				},
				owner: 'lister',
				slug: 'banana',
			} );

			chaiExpect( initialState ).to.eql( [ { owner: 'lister', slug: 'banana' } ] );

			const state = missingLists( initialState, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' },
					{ ID: 413, title: 'Mangos and feijoas', owner: 'lister', slug: 'mango' },
				],
			} );

			chaiExpect( state ).to.eql( [] );
		} );

		test( 'should remove a missing list if a successful single list response is received', () => {
			const initialState = missingLists( undefined, {
				type: READER_LIST_REQUEST_FAILURE,
				error: {
					statusCode: 404,
				},
				owner: 'lister',
				slug: 'banana',
			} );

			chaiExpect( initialState ).to.eql( [ { owner: 'lister', slug: 'banana' } ] );

			const state = missingLists( initialState, {
				type: READER_LIST_REQUEST_SUCCESS,
				data: {
					list: { ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' },
				},
			} );

			chaiExpect( state ).to.eql( [] );
		} );
	} );

	describe( '#subscribedLists', () => {
		test( 'should default to empty', () => {
			chaiExpect( subscribedLists( undefined, { type: '@@BAD' } ) ).to.eql( [] );
		} );

		test( 'should pick up the ids of the subscribed lists', () => {
			expect(
				subscribedLists( deepFreeze( [] ), {
					type: READER_LISTS_RECEIVE,
					lists: [ { ID: 1 }, { ID: 2 } ],
				} )
			).toEqual( expect.arrayContaining( [ 1, 2 ] ) );
		} );

		test( 'should overwrite existing subs', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LISTS_RECEIVE,
					lists: [ { ID: 3 }, { ID: 1 } ],
				} )
			).toEqual( expect.arrayContaining( [ 1, 3 ] ) );
		} );

		test( 'should add an item on follow', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LISTS_FOLLOW_SUCCESS,
					data: {
						list: { ID: 5 },
					},
				} )
			).toEqual( expect.arrayContaining( [ 1, 2, 5 ] ) );
		} );

		test( 'should remove an item on unfollow', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LISTS_UNFOLLOW_SUCCESS,
					data: {
						list: { ID: 1 },
					},
				} )
			).toEqual( [ 2 ] );
		} );
	} );
} );
