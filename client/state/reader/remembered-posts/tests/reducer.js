/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	READER_REMEMBERED_POSTS_REMEMBER,
	READER_REMEMBERED_POSTS_FORGET,
	READER_REMEMBERED_POSTS_UPDATE_STATUS,
	READER_POSTS_RECEIVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { READER_REMEMBERED_POSTS_STATUS } from 'state/reader/remembered-posts/status';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for successful remember', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_REMEMBERED_POSTS_REMEMBER,
				payload: { siteId: 123, postId: 456 },
			} );

			expect( state[ '123-456' ] ).toEqual( READER_REMEMBERED_POSTS_STATUS.remembered );
		} );

		test( 'should update for successful forget', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_REMEMBERED_POSTS_FORGET,
				payload: { siteId: 123, postId: 456 },
			} );

			expect( state[ '123-456' ] ).toEqual( READER_REMEMBERED_POSTS_STATUS.forgotten );
		} );

		test( 'should update when given a valid status', () => {
			const original = deepFreeze( { '123-456': READER_REMEMBERED_POSTS_STATUS.forgotten } );

			const state = items( original, {
				type: READER_REMEMBERED_POSTS_UPDATE_STATUS,
				payload: { siteId: 123, postId: 456, status: READER_REMEMBERED_POSTS_STATUS.remembered },
			} );

			expect( state[ '123-456' ] ).toEqual( READER_REMEMBERED_POSTS_STATUS.remembered );
		} );

		test( 'should remove the given site and post from state entirely if the user is not following the post', () => {
			const original = deepFreeze( { '123-456': 'M' } );

			const state = items( original, {
				type: READER_REMEMBERED_POSTS_UPDATE_STATUS,
				payload: { siteId: 123, postId: 456, status: null },
			} );

			expect( state ).not.toHaveProperty( '123-456' );
		} );

		test( 'should add a new follow when new posts are received', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [
					{ site_ID: 123, ID: 456, is_remembered: true },
					{ site_ID: 123, ID: 789, is_remembered: true },
				],
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
			expect( state[ '123-789' ] ).toEqual( 'F' );
		} );

		test( 'should not add a new follow from a post when is_remembered is false', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [ { site_ID: 123, ID: 456, is_remembered: false } ],
			} );

			expect( state ).not.toHaveProperty( '123-456' );
		} );

		test( 'should update an existing follow status when new posts are received', () => {
			const original = deepFreeze( { '123-456': 'M', '123-678': 'M' } );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [ { site_ID: 123, ID: 456, is_remembered: true } ],
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
			expect( state[ '123-678' ] ).toEqual( 'M' );
		} );

		test( 'will deserialize valid state', () => {
			const validState = { '123-456': 'M' };
			expect( items( validState, { type: DESERIALIZE } ) ).toEqual( validState );
		} );

		test( 'will not deserialize invalid state', () => {
			const invalidState = { '123-456': 'X' };
			expect( items( invalidState, { type: DESERIALIZE } ) ).toEqual( {} );
		} );

		test( 'will serialize', () => {
			const validState = { '123-456': 'M' };
			expect( items( validState, { type: SERIALIZE } ) ).toEqual( validState );
		} );
	} );
} );
