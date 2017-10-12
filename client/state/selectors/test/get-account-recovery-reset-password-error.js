/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetPasswordError } from '../';

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

		expect( getAccountRecoveryResetPasswordError( state ) ).toEqual( error );
	} );

	test( 'should return null as default value.', () => {
		expect( getAccountRecoveryResetPasswordError( undefined ) ).toBeNull();
	} );
} );
