/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isRequestingResetPassword } from '../';

describe( 'isRequestingResetPassword()', () => {
	test( 'should return isRequesting field under resetPassword state tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					resetPassword: {
						isRequesting: true,
					},
				},
			},
		} );

		expect( isRequestingResetPassword( state ) ).toBe( true );
	} );

	test( 'should return false as default value.', () => {
		expect( isRequestingResetPassword( undefined ) ).toBe( false );
	} );
} );
