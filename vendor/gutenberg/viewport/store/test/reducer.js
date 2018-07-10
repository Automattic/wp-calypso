/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'defaults to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	it( 'replaces its state in response to new matching values', () => {
		const original = deepFreeze( reducer( undefined, {} ) );
		const state = reducer( original, {
			type: 'SET_IS_MATCHING',
			values: {
				huge: true,
			},
		} );

		expect( state ).toEqual( {
			huge: true,
		} );
	} );
} );
