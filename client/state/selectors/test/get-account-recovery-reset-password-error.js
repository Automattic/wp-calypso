/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetPasswordError } from '../';

describe( 'getAccountRecoveryResetPasswordError()', () => {
	it( 'should return the error field under resetPassword state tree.', () => {
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

	it( 'should return null as default value.', () => {
		assert.isNull( getAccountRecoveryResetPasswordError( undefined ) );
	} );
} );
