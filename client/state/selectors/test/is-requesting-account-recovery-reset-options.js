/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingAccountRecoveryResetOptions } from '../';

describe( 'isRequestingAccountRecoveryResetOptions()', () => {
	it( 'should return the isRequesting flag under the accountRecovery.reset.options substate tree.', () => {
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
