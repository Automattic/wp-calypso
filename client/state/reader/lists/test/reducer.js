/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, listItems, updatedLists, missingLists, subscribedLists } from '../reducer';
import {
	READER_LIST_DELETE,
	READER_LISTS_RECEIVE,
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index lists by ID', () => {
			const state = items( null, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World' },
					{ ID: 413, title: 'Mangos and feijoas' },
				],
			} );

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' },
			} );
		} );

		test( 'should remove a list on delete', () => {
			const initial = deepFreeze( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' },
			} );
			expect(
				items( initial, {
					type: READER_LIST_DELETE,
					listId: 841,
				} )
			).toEqual( { 413: { ID: 413, title: 'Mangos and feijoas' } } );
		} );
	} );

	describe( '#listItems()', () => {
		test( 'should default to an empty object', () => {
			const state = listItems( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should remove list items when list is deleted', () => {
			const initial = deepFreeze( {
				123: [
					{ ID: 12345, site_ID: 555 },
					{ ID: 12346, feed_ID: 333 },
				],
				124: [ { ID: 12347, tag_ID: 444 } ],
			} );
			const state = listItems( initial, {
				type: READER_LIST_DELETE,
				listId: 124,
			} );

			// Should have removed 124 key entirely
			expect( state ).toEqual( {
				123: [
					{ ID: 12345, site_ID: 555 },
					{ ID: 12346, feed_ID: 333 },
				],
			} );
		} );
	} );

	describe( '#updatedLists()', () => {
		test( 'should default to an empty array', () => {
			const state = updatedLists( undefined, {} );
			expect( state ).toEqual( [] );
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

			expect( state ).toEqual( [ 841 ] );
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

			expect( state ).toEqual( [ 841 ] );

			state = updatedLists( null, {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 841,
			} );

			expect( state ).toEqual( [] );
		} );
	} );

	describe( '#missingLists()', () => {
		test( 'should default to an empty array', () => {
			const state = missingLists( undefined, {} );
			expect( state ).toEqual( [] );
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

			expect( state ).toEqual( [ { owner: 'lister', slug: 'banana' } ] );
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

			expect( state ).toEqual( [] );
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

			expect( initialState ).toEqual( [ { owner: 'lister', slug: 'banana' } ] );

			const state = missingLists( initialState, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' },
					{ ID: 413, title: 'Mangos and feijoas', owner: 'lister', slug: 'mango' },
				],
			} );

			expect( state ).toEqual( [] );
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

			expect( initialState ).toEqual( [ { owner: 'lister', slug: 'banana' } ] );

			const state = missingLists( initialState, {
				type: READER_LIST_REQUEST_SUCCESS,
				data: {
					list: { ID: 841, title: 'Hello World', owner: 'lister', slug: 'banana' },
				},
			} );

			expect( state ).toEqual( [] );
		} );
	} );

	describe( '#subscribedLists', () => {
		test( 'should default to empty', () => {
			expect( subscribedLists( undefined, { type: '@@BAD' } ) ).toEqual( [] );
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

		test( 'should remove a list on delete', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LIST_DELETE,
					listId: 1,
				} )
			).toEqual( [ 2 ] );
		} );
	} );
} );
