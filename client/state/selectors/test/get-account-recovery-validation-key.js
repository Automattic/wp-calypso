/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryValidationKey } from '../';

describe( 'getAccountRecoveryValidationKey()', () => {
	test( 'should return the key field under the account recovery state tree.', () => {
		const key = '5201314';
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					key,
				},
			},
		} );

		expect( getAccountRecoveryValidationKey( state ) ).toEqual( key );
	} );

	test( 'should return null as the default value.', () => {
		expect( getAccountRecoveryValidationKey( undefined ) ).toBeNull();
	} );
} );
