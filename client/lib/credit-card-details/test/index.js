/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { getCreditCardType } from '../';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

describe( 'index', () => {
	describe( 'Validation', () => {
		describe( 'Discover Card: range 622126-622925', () => {
			const randomNumberBetweenRange = getRandomInt( 622126, 622925 ).toString();

			test( 'should return null for 622125', () => {
				assert.equal( getCreditCardType( '622125' ), null );
			} );

			test( 'should return `discover` for 622126', () => {
				assert.equal( getCreditCardType( '622126' ), 'discover' );
			} );

			test(
				'should return `discover` for ' +
					randomNumberBetweenRange +
					' (a random number between 622126 and 622925)',
				() => {
					assert.equal( getCreditCardType( randomNumberBetweenRange ), 'discover' );
				}
			);

			test( 'should return `discover` for 622925', () => {
				assert.equal( getCreditCardType( '622925' ), 'discover' );
			} );

			test( 'should return null for 622926', () => {
				assert.equal( getCreditCardType( '622926' ), null );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', () => {
			test( 'should return null for 2220990000000000', () => {
				assert.equal( getCreditCardType( '2220990000000000' ), null );
			} );

			test( 'should return `mastercard` for 2221000000000000', () => {
				assert.equal( getCreditCardType( '2221000000000000' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 2720990000000000', () => {
				assert.equal( getCreditCardType( '2720990000000000' ), 'mastercard' );
			} );

			test( 'should return null for 2721000000000000', () => {
				assert.equal( getCreditCardType( '2721000000000000' ), null );
			} );
		} );

		describe( 'Mastercard: range 51-55', () => {
			test( 'should return null for 5099999999999999', () => {
				assert.equal( getCreditCardType( '5099999999999999' ), null );
			} );

			test( 'should return `mastercard` for 5100000000000000', () => {
				assert.equal( getCreditCardType( '5599000000000000' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 5599000000000000', () => {
				assert.equal( getCreditCardType( '5599000000000000' ), 'mastercard' );
			} );

			test( 'should return null for 5600000000000000', () => {
				assert.equal( getCreditCardType( '5600000000000000' ), null );
			} );
		} );
	} );
} );
