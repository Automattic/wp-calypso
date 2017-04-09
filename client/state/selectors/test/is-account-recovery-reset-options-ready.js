/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isAccountRecoveryResetOptionsReady } from '../';

describe( 'isAccountRecoveryResetOptionsReady()', () => {
	it( 'should return false if items array is empty', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [],
					}
				},
			},
		};

		assert.isFalse( isAccountRecoveryResetOptionsReady( state ) );
	} );

	it( 'should return false if there is an existing error', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [
							{
								email: 'primary@example.com',
								sms: '1234567',
							}
						],
						error: {
							status: 404,
							message: 'Something wrong!',
						},
					}
				},
			},
		};

		assert.isFalse( isAccountRecoveryResetOptionsReady( state ) );
	} );

	it( 'should return true if items array is populated and there is no error', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: [
							{
								email: 'primary@example.com',
								sms: '1234567',
							}
						],
					}
				},
			},
		};

		assert.isTrue( isAccountRecoveryResetOptionsReady( state ) );
	} );
} );
