import deepFreeze from 'deep-freeze';
import {
	READER_LIST_DELETE,
	READER_LIST_FOLLOW_RECEIVE,
	READER_LIST_UNFOLLOW_RECEIVE,
	READER_LIST_CREATE_SUCCESS,
	READER_LISTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { items, listItems, subscribedLists } from '../reducer';

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

		test( 'should add a list on follow', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LIST_FOLLOW_RECEIVE,
					list: { ID: 5 },
				} )
			).toEqual( expect.arrayContaining( [ 1, 2, 5 ] ) );
		} );

		test( 'should remove a list on unfollow', () => {
			const initial = deepFreeze( [ 1, 2 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LIST_UNFOLLOW_RECEIVE,
					list: { ID: 1 },
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
		test( 'should add a list on creation', () => {
			const initial = deepFreeze( [ 1 ] );
			expect(
				subscribedLists( initial, {
					type: READER_LIST_CREATE_SUCCESS,
					data: {
						list: { ID: 2 },
					},
				} )
			).toEqual( [ 1, 2 ] );
		} );
	} );
} );
