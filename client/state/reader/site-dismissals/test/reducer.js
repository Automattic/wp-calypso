import deepFreeze from 'deep-freeze';
import { READER_DISMISS_SITE, READER_DISMISS_POST } from 'calypso/state/reader/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for a successful dismissal', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_DISMISS_SITE,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );

		test( 'should update for a successful post dismissal', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_DISMISS_POST,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );
	} );
} );
