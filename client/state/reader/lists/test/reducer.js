import deepFreeze from 'deep-freeze';
import {
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { listItems, userRecommendedBlogs, isRequestingUserRecommendedBlogs } from '../reducer';

describe( 'reducer', () => {
	describe( '#listItems()', () => {
		test( 'should default to an empty object', () => {
			const state = listItems( undefined, {} );
			expect( state ).toEqual( {} );
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
