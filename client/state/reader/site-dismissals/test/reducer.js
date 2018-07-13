/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { READER_STREAMS_DISMISS_SITE } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for a successful dismissal', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_STREAMS_DISMISS_SITE,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );
	} );
} );
