/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isRequestingResetPassword } from '../';

describe( 'isRequestingResetPassword()', () => {
	it( 'should return isRequesting field under resetPassword state tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					resetPassword: {
						isRequesting: true,
					},
				},
			},
		} );

		assert.isTrue( isRequestingResetPassword( state ) );
	} );

	it( 'should return false as default value.', () => {
		assert.isFalse( isRequestingResetPassword( undefined ) );
	} );
} );
