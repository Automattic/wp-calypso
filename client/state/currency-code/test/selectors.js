/**
 * Internal dependencies
 */
import { getCurrentUserCurrencyCode } from '../selectors';

describe( 'getCurrentUserCurrencyCode', () => {
	test( 'should return null if currencyCode is not set', () => {
		const selected = getCurrentUserCurrencyCode( {
			currencyCode: null,
		} );
		expect( selected ).toBeNull();
	} );

	test( 'should return value if currencyCode is set', () => {
		const selected = getCurrentUserCurrencyCode( {
			currencyCode: 'USD',
		} );
		expect( selected ).toBe( 'USD' );
	} );
} );
