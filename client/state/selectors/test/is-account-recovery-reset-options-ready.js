/** @format */

/**
 * External dependencies
 */
import { isAccountRecoveryResetOptionsReady } from '../';

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

		expect( isAccountRecoveryResetOptionsReady( state ) ).toBe( false );
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

		expect( isAccountRecoveryResetOptionsReady( state ) ).toBe( false );
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

		expect( isAccountRecoveryResetOptionsReady( state ) ).toBe( true );
	} );
} );
