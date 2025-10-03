import deepFreeze from 'deep-freeze';
import {
	READER_LIST_DELETE,
	READER_LIST_FOLLOW_RECEIVE,
	READER_LIST_UNFOLLOW_RECEIVE,
	READER_LIST_CREATE_SUCCESS,
	READER_LISTS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import {
	items,
	listItems,
	subscribedLists,
	userRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} from '../reducer';

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

	describe( '#userRecommendedBlogs', () => {
		test( 'should default to an empty object', () => {
			const state = userRecommendedBlogs( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should store recommended blogs items by list owner', () => {
			const state = userRecommendedBlogs(
				{},
				{
					type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
					listOwner: 'testuser',
					listItems: [
						{ ID: 123, title: 'Test Blog 1' },
						{ ID: 456, title: 'Test Blog 2' },
					],
				}
			);

			expect( state ).toEqual( {
				testuser: [
					{ ID: 123, title: 'Test Blog 1' },
					{ ID: 456, title: 'Test Blog 2' },
				],
			} );
		} );

		test( 'should accumulate recommended blogs for different users', () => {
			const original = deepFreeze( {
				user1: [ { ID: 123, title: 'User 1 Blog' } ],
			} );
			const state = userRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
				listOwner: 'user2',
				listItems: [ { ID: 456, title: 'User 2 Blog' } ],
			} );

			expect( state ).toEqual( {
				user1: [ { ID: 123, title: 'User 1 Blog' } ],
				user2: [ { ID: 456, title: 'User 2 Blog' } ],
			} );
		} );

		test( 'should overwrite existing recommended blogs for the same user', () => {
			const original = deepFreeze( {
				testuser: [ { ID: 123, title: 'Old Blog' } ],
			} );
			const state = userRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
				listOwner: 'testuser',
				listItems: [ { ID: 456, title: 'New Blog' } ],
			} );

			expect( state ).toEqual( {
				testuser: [ { ID: 456, title: 'New Blog' } ],
			} );
		} );

		test( 'should return unchanged state for unknown action types', () => {
			const original = deepFreeze( {
				testuser: [ { ID: 123, title: 'Test Blog' } ],
			} );
			const state = userRecommendedBlogs( original, {
				type: 'UNKNOWN_ACTION',
				listOwner: 'testuser',
				listItems: [ { ID: 456, title: 'New Blog' } ],
			} );

			expect( state ).toBe( original );
		} );
	} );

	describe( '#isRequestingUserRecommendedBlogs', () => {
		test( 'should default to an empty object', () => {
			const state = isRequestingUserRecommendedBlogs( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should set requesting state to true when request starts', () => {
			const state = isRequestingUserRecommendedBlogs(
				{},
				{
					type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
					listOwner: 'testuser',
				}
			);

			expect( state ).toEqual( {
				testuser: true,
			} );
		} );

		test( 'should set requesting state to false when request succeeds', () => {
			const original = deepFreeze( {
				testuser: true,
			} );
			const state = isRequestingUserRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
				listOwner: 'testuser',
				listItems: [ { ID: 123, title: 'Test Blog' } ],
			} );

			expect( state ).toEqual( {
				testuser: false,
			} );
		} );

		test( 'should set requesting state to false when request fails', () => {
			const original = deepFreeze( {
				testuser: true,
			} );
			const state = isRequestingUserRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
				listOwner: 'testuser',
				error: new Error( 'Request failed' ),
			} );

			expect( state ).toEqual( {
				testuser: false,
			} );
		} );

		test( 'should accumulate requesting states for different users', () => {
			const original = deepFreeze( {
				user1: false,
			} );
			const state = isRequestingUserRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner: 'user2',
			} );

			expect( state ).toEqual( {
				user1: false,
				user2: true,
			} );
		} );

		test( "should only update the specific user's requesting state", () => {
			const original = deepFreeze( {
				user1: true,
				user2: false,
			} );
			const state = isRequestingUserRecommendedBlogs( original, {
				type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
				listOwner: 'user1',
				listItems: [ { ID: 123, title: 'Test Blog' } ],
			} );

			expect( state ).toEqual( {
				user1: false,
				user2: false,
			} );
		} );

		test( 'should return unchanged state for unknown action types', () => {
			const original = deepFreeze( {
				testuser: true,
			} );
			const state = isRequestingUserRecommendedBlogs( original, {
				type: 'UNKNOWN_ACTION',
				listOwner: 'testuser',
			} );

			expect( state ).toBe( original );
		} );
	} );
} );
