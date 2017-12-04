/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isAccountRecoveryResetPasswordSucceeded } from 'state/selectors';

describe( 'isAccountRecoveryResetPasswordSucceeded()', () => {
	test( 'should return succeeded field under resetPassword state tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					resetPassword: {
						succeeded: true,
					},
				},
			},
		} );

		assert.isTrue( isAccountRecoveryResetPasswordSucceeded( state ) );
	} );

	test( 'should return false as default value.', () => {
		assert.isFalse( isAccountRecoveryResetPasswordSucceeded( undefined ) );
	} );
} );
