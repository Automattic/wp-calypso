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
	SERIALIZE,
	DESERIALIZE,
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
