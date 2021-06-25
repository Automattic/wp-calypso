/**
 * Internal dependencies
 */
import localeSuggestions from '../reducer';
import { I18N_LOCALE_SUGGESTIONS_ADD } from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to null', () => {
			const state = localeSuggestions( undefined, {} );
			expect( state ).toBe( null );
		} );

		test( 'should update with items', () => {
			const state = localeSuggestions( undefined, {
				type: I18N_LOCALE_SUGGESTIONS_ADD,
				items: [ { bilbo: 'baggins' } ],
			} );

			expect( state ).toEqual( [ { bilbo: 'baggins' } ] );
		} );
	} );
} );
