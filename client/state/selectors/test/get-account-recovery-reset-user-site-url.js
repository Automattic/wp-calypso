/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserSiteUrl } from '../';

describe( 'getAccountRecoveryResetUserSiteUrl', () => {
	it( 'should return the url field under the account recovery state tree', () => {
		const expectedSiteUrl = 'Bar';
		const state = {
			accountRecovery: {
				reset: {
					userData: {
						url: expectedSiteUrl,
					},
				},
			},
		};

		assert.equal( getAccountRecoveryResetUserSiteUrl( state ), expectedSiteUrl );
	} );
} );
