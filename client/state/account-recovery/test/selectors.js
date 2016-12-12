/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	isFetchingAccountRecoverySettings,
} from '../selectors';

describe( '#account-recovery selector isFetchingAccountRecoverySettings:', () => {
	it( 'should return the correct property.', () => {
		const state = {
			accountRecovery: {
				isFetchingSettings: true,
			},
		};

		assert.isTrue( isFetchingAccountRecoverySettings( state ) );
	} );
} );
