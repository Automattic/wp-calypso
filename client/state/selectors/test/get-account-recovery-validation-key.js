/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryValidationKey } from '../';

describe( 'getAccountRecoveryValidationKey()', () => {
	it( 'should return the key field under the account recovery state tree.', () => {
		const key = '5201314';
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					key,
				},
			},
		} );

		assert.equal( getAccountRecoveryValidationKey( state ), key );
	} );

	it( 'should return null as the default value.', () => {
		assert.isNull( getAccountRecoveryValidationKey( undefined ) );
	} );
} );
