/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryCurrentRoute } from '../';

describe( 'getAccountRecoveryCurrentRoute()', () => {
	it( 'should return the slug representing the route at where the account recovery process is', () => {
		const sampleRoute = '/account-recovery/reset-password';
		const state = {
			accountRecovery: {
				reset: {
					currentRoute: sampleRoute,
				},
			},
		};

		assert.equal( getAccountRecoveryCurrentRoute( state ), sampleRoute );
	} );
} );
