/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isFetchingAccountRecoverySettings } from '../selectors';

describe( '#account-recovery selector isFetchingAccountRecoverySettings:', () => {
	test( 'should return the field isFetchingSettings.', () => {
		const state = {
			accountRecovery: {
				isFetchingSettings: true,
			},
		};

		assert.isTrue( isFetchingAccountRecoverySettings( state ) );
	} );
} );
