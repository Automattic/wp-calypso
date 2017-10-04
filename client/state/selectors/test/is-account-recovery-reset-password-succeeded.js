/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isAccountRecoveryResetPasswordSucceeded } from '../';

describe( 'isAccountRecoveryResetPasswordSucceeded()', () => {
	it( 'should return succeeded field under resetPassword state tree.', () => {
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

	it( 'should return false as default value.', () => {
		assert.isFalse( isAccountRecoveryResetPasswordSucceeded( undefined ) );
	} );
} );
