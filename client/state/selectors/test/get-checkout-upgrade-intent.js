/**
 * Internal dependencies
 */
import getCheckoutUpgradeIntent from '../get-checkout-upgrade-intent';

describe( 'getCheckoutUpgradeIntent()', () => {
	test( 'should return empty string when undefined', () => {
		expect( getCheckoutUpgradeIntent( {} ) ).toBe( '' );
	} );

	test( 'should return value', () => {
		expect(
			getCheckoutUpgradeIntent( {
				ui: {
					checkout: {
						upgradeIntent: 'phoenix feather',
					},
				},
			} )
		).toBe( 'phoenix feather' );
	} );
} );
