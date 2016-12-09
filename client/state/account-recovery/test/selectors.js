/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	isFetchingAccountRecoverySettings,
	getAccountRecoverySettings,
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

describe( '#account-recovery selector getAccountRecoverySettings:', () => {
	it( 'should extract where the settings reside.', () => {
		const settings = {
			email: 'aaa@example.com',
			emailValidated: false,
		};
		const state = {
			accountRecovery: {
				settings
			},
		};

		assert.deepEqual( getAccountRecoverySettings( state ), settings );
	} );
} );
