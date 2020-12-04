/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { tryToGuessPostalCodeFormat } from 'calypso/lib/postal-code';

describe( 'Postal Code Utils', () => {
	test( 'should format valid GB code, length 7', () => {
		assert.equal( tryToGuessPostalCodeFormat( 'WC1R4PF', 'GB' ), 'WC1R 4PF' );
	} );

	test( 'should format valid GB code, length 5', () => {
		assert.equal( tryToGuessPostalCodeFormat( 'M11AA', 'GB' ), 'M1 1AA' );
	} );

	test( 'should format valid GB code, length 6', () => {
		assert.equal( tryToGuessPostalCodeFormat( 'B338TH', 'GB' ), 'B33 8TH' );
	} );

	test( 'should format valid GB code, spaces wrong, length 6', () => {
		assert.equal( tryToGuessPostalCodeFormat( 'B 338T H', 'GB' ), 'B33 8TH' );
	} );

	test( 'should format valid GB code, wrong delimeter, length 6', () => {
		assert.equal( tryToGuessPostalCodeFormat( 'B33-8TH', 'GB' ), 'B33 8TH' );
	} );
} );
