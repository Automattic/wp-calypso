/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingAccountRecoveryResetOptions } from 'state/selectors';

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

		assert.isTrue( isRequestingAccountRecoveryResetOptions( state ) );
	} );
} );
