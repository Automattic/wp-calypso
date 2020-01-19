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

		expect( isFetchingAccountRecoverySettings( state ) ).toBe( true );
	} );
} );
