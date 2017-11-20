/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { READER_SITE_BLOCK, READER_SITE_UNBLOCK } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for a successful block', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_BLOCK,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );

		test( 'should update for a successful unblock', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_UNBLOCK,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( false );
		} );
	} );
} );
