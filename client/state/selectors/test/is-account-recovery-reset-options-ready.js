/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isAccountRecoveryResetOptionsReady } from 'state/selectors';

describe( 'isAccountRecoveryResetOptionsReady()', () => {
	test( 'should return false if items array is empty', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [],
					},
				},
			},
		};

		assert.isFalse( isAccountRecoveryResetOptionsReady( state ) );
	} );

	test( 'should return false if there is an existing error', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [
							{
								email: 'primary@example.com',
								sms: '1234567',
							},
						],
						error: {
							status: 404,
							message: 'Something wrong!',
						},
					},
				},
			},
		};

		assert.isFalse( isAccountRecoveryResetOptionsReady( state ) );
	} );

	test( 'should return true if items array is populated and there is no error', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [
							{
								email: 'primary@example.com',
								sms: '1234567',
							},
						],
					},
				},
			},
		};

		assert.isTrue( isAccountRecoveryResetOptionsReady( state ) );
	} );
} );
