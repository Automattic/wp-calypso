/** @format */

/**
 * Internal dependencies
 */
import { getPaymentCountryCode } from 'state/selectors';

describe( 'getPaymentCountryCode()', () => {
	test( 'should return null if there is no payment country available', () => {
		const state = {};
		const result = getPaymentCountryCode( state );
		expect( result ).toBeNull();
	} );

	test( 'should return the correct payment country code from the payment state', () => {
		const state = {
			ui: {
				payment: {
					countryCode: 'US',
				},
			},
		};
		const result = getPaymentCountryCode( state );
		expect( result ).toEqual( 'US' );
	} );
} );
