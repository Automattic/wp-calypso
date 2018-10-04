/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getAccountRecoveryResetPasswordError from 'state/selectors/get-account-recovery-reset-password-error';

describe( 'getAccountRecoveryResetPasswordError()', () => {
	test( 'should return the error field under resetPassword state tree.', () => {
		const error = {
			status: 400,
			message: 'Something wrong!',
		};
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					resetPassword: {
						error,
					},
				},
			},
		} );

		assert.deepEqual( getAccountRecoveryResetPasswordError( state ), error );
	} );

	test( 'should return null as default value.', () => {
		assert.isNull( getAccountRecoveryResetPasswordError( undefined ) );
	} );
} );
