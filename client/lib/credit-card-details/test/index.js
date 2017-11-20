/** @format */

/**
 * External dependencies
 */

import assert from 'assert';

/**
 * Internal dependencies
 */
import creditCardDetails from '../';

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

describe( 'index', () => {
	describe( 'Validation', () => {
		describe( 'Discover Card: range 622126-622925', () => {
			const randomNumberBetweenRange = getRandomInt( 622126, 622925 ).toString();

			test( 'should return null for 622125', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '622125' ) );
			} );

			test( 'should return `discover` for 622126', () => {
				assert.equal( 'discover', creditCardDetails.getCreditCardType( '622126' ) );
			} );

			test(
				'should return `discover` for ' +
					randomNumberBetweenRange +
					' (a random number between 622126 and 622925)',
				() => {
					assert.equal(
						'discover',
						creditCardDetails.getCreditCardType( randomNumberBetweenRange )
					);
				}
			);

			test( 'should return `discover` for 622925', () => {
				assert.equal( 'discover', creditCardDetails.getCreditCardType( '622925' ) );
			} );

			test( 'should return null for 622926', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '622926' ) );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', () => {
			test( 'should return null for 2220990000000000', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '2220990000000000' ) );
			} );

			test( 'should return `mastercard` for 2221000000000000', () => {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '2221000000000000' ) );
			} );

			test( 'should return `mastercard` for 2720990000000000', () => {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '2720990000000000' ) );
			} );

			test( 'should return null for 2721000000000000', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '2721000000000000' ) );
			} );
		} );

		describe( 'Mastercard: range 51-55', () => {
			test( 'should return null for 5099999999999999', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '5099999999999999' ) );
			} );

			test( 'should return `mastercard` for 5100000000000000', () => {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '5599000000000000' ) );
			} );

			test( 'should return `mastercard` for 5599000000000000', () => {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '5599000000000000' ) );
			} );

			test( 'should return null for 5600000000000000', () => {
				assert.equal( null, creditCardDetails.getCreditCardType( '5600000000000000' ) );
			} );
		} );
	} );
} );
