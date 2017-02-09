/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryPasswordResetOptions } from '../';

describe( 'getAccountRecoveryPasswordResetOptions()', () => {
	it( 'should return the items array under accountRecovery/reset substate tree.', () => {
		const resetOptionItems = [
			{
				email: 'primary@example.com',
				sms: '1234567',
			},
			{
				email: 'secondary@example.com',
				sms: '1234567',
			},
		];

		const state = {
			accountRecovery: {
				reset: {
					options: {
						items: resetOptionItems,
					},
				},
			},
		};

		assert.deepEqual( getAccountRecoveryPasswordResetOptions( state ), resetOptionItems );
	} );
} );
