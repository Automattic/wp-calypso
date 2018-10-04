/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getAccountRecoveryValidationKey from 'state/selectors/get-account-recovery-validation-key';

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

		assert.equal( getAccountRecoveryValidationKey( state ), key );
	} );

	test( 'should return null as the default value.', () => {
		assert.isNull( getAccountRecoveryValidationKey( undefined ) );
	} );
} );
