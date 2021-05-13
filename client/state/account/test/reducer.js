/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isClosed } from '../reducer';
import { ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#isClosed()', () => {
		test( 'should default to false', () => {
			const state = isClosed( undefined, {} );
			expect( state ).toEqual( false );
		} );

		test( 'should update for a successful account closure', () => {
			const original = deepFreeze( {} );

			const state = isClosed( original, {
				type: ACCOUNT_CLOSE_SUCCESS,
			} );

			expect( state ).toEqual( true );
		} );
	} );
} );
