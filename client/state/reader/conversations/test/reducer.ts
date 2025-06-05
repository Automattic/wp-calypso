// @ts-nocheck - TODO: Fix TypeScript issues
import deepFreeze from 'deep-freeze';
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_POSTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, { type: '@@TEST/INIT' } );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for successful follow', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_CONVERSATION_FOLLOW,
				payload: { siteId: 123, postId: 456 },
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
		} );

		test( 'should update for successful mute', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_CONVERSATION_MUTE,
				payload: { siteId: 123, postId: 456 },
			} );

			expect( state[ '123-456' ] ).toEqual( 'M' );
		} );

		test( 'should update when given a valid follow status', () => {
			const original = deepFreeze( { '123-456': 'M' } );

			const state = items( original, {
				type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
				payload: { siteId: 123, postId: 456, followStatus: 'F' },
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
		} );

		test( 'should remove the given site and post from state entirely if the user is not following the post', () => {
			const original = deepFreeze( { '123-456': 'M' } );

			const state = items( original, {
				type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
				payload: { siteId: 123, postId: 456, followStatus: null },
			} );

			expect( state ).not.toHaveProperty( '123-456' );
		} );

		test( 'should add a new follow when new posts are received', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [
					{ site_ID: 123, ID: 456, is_following_conversation: true },
					{ site_ID: 123, ID: 789, is_following_conversation: true },
				],
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
			expect( state[ '123-789' ] ).toEqual( 'F' );
		} );

		test( 'should not add a new follow from a post when is_following_conversation is false', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [ { site_ID: 123, ID: 456, is_following_conversation: false } ],
			} );

			expect( state ).not.toHaveProperty( '123-456' );
		} );

		test( 'should update an existing follow status when new posts are received', () => {
			const original = deepFreeze( { '123-456': 'M', '123-678': 'M' } );

			const state = items( original, {
				type: READER_POSTS_RECEIVE,
				posts: [ { site_ID: 123, ID: 456, is_following_conversation: true } ],
			} );

			expect( state[ '123-456' ] ).toEqual( 'F' );
			expect( state[ '123-678' ] ).toEqual( 'M' );
		} );

		test( 'will deserialize valid state', () => {
			const validState = { '123-456': 'M' };
			expect( deserialize( items, validState ) ).toEqual( validState );
		} );

		test( 'will not deserialize invalid state', () => {
			const invalidState = { '123-456': 'X' };
			expect( deserialize( items, invalidState ) ).toEqual( {} );
		} );

		test( 'will serialize', () => {
			const validState = { '123-456': 'M' };
			expect( serialize( items, validState ) ).toEqual( validState );
		} );
	} );
} );
