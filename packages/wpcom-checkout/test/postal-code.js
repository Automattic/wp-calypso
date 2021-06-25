/**
 * Internal dependencies
 */
import { tryToGuessPostalCodeFormat } from '../src';

describe( 'Postal Code Utils', () => {
	test( 'should format valid GB code, length 7', () => {
		expect( tryToGuessPostalCodeFormat( 'WC1R4PF', 'GB' ) ).toStrictEqual( 'WC1R 4PF' );
	} );

	test( 'should format valid GB code, length 5', () => {
		expect( tryToGuessPostalCodeFormat( 'M11AA', 'GB' ) ).toStrictEqual( 'M1 1AA' );
	} );

	test( 'should format valid GB code, length 6', () => {
		expect( tryToGuessPostalCodeFormat( 'B338TH', 'GB' ) ).toStrictEqual( 'B33 8TH' );
	} );

	test( 'should format valid GB code, spaces wrong, length 6', () => {
		expect( tryToGuessPostalCodeFormat( 'B 338T H', 'GB' ) ).toStrictEqual( 'B33 8TH' );
	} );

	test( 'should format valid GB code, wrong delimeter, length 6', () => {
		expect( tryToGuessPostalCodeFormat( 'B33-8TH', 'GB' ) ).toStrictEqual( 'B33 8TH' );
	} );
} );
