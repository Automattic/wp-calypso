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
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
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

		test( 'should not update when given an invalid follow status', () => {
			const original = deepFreeze( { '123-456': 'M' } );

			const state = items( original, {
				type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
				payload: { siteId: 123, postId: 456, followStatus: 'X' },
			} );

			expect( state[ '123-456' ] ).toEqual( 'M' );
		} );
	} );
} );
