/** @format */

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { I18N_LOCALE_SUGGESTIONS_ADD } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'items' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to null', () => {
			const state = items( undefined, {} );
			expect( state ).toBe( null );
		} );

		test( 'should update with items', () => {
			const state = items( undefined, {
				type: I18N_LOCALE_SUGGESTIONS_ADD,
				items: [ { bilbo: 'baggins' } ],
			} );

			expect( state ).toEqual( [ { bilbo: 'baggins' } ] );
		} );
	} );
} );
