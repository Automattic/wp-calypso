/** @format */

/**
 * External dependencies
 */
import { isRequestingAccountRecoveryResetOptions } from '../';

describe( 'isRequestingAccountRecoveryResetOptions()', () => {
	test( 'should return the isRequesting flag under the accountRecovery.reset.options substate tree.', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {
						isRequesting: true,
					},
				},
			},
		};

		expect( isRequestingAccountRecoveryResetOptions( state ) ).toBe( true );
	} );
} );
