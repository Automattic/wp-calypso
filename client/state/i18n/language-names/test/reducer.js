/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { I18N_LANGUAGE_NAMES_ADD } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'items' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toBe( null );
		} );

		test( 'should update with items', () => {
			const state = items( undefined, {
				type: I18N_LANGUAGE_NAMES_ADD,
				items: { neil: 'down' },
			} );

			expect( state ).toEqual( { neil: 'down' } );
		} );
	} );
} );
