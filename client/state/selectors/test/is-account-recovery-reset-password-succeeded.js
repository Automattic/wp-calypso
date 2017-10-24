/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isAccountRecoveryResetPasswordSucceeded } from '../';

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

		expect( isAccountRecoveryResetPasswordSucceeded( state ) ).toBe( true );
	} );

	test( 'should return false as default value.', () => {
		expect( isAccountRecoveryResetPasswordSucceeded( undefined ) ).toBe( false );
	} );
} );
