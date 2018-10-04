/** @format */

/**
 * Internal dependencies
 */
import { setPaymentCountryCode } from '../actions';
import { PAYMENT_COUNTRY_CODE_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'setPaymentCountryCode', () => {
		test( 'should return an appropriate action for the provided country code', () => {
			expect( setPaymentCountryCode( 'US' ) ).toEqual( {
				type: PAYMENT_COUNTRY_CODE_SET,
				countryCode: 'US',
			} );
		} );
	} );
} );
