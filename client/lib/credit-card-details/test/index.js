/**
 * Internal dependencies
 */
import creditCardDetails from '../';
import assert from 'assert';

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

describe( 'index', function() {
	describe( 'Validation', function() {
		describe( 'Discover Card: range 622126-622925', function() {
			const randomNumberBetweenRange = getRandomInt( 622126, 622925 ).toString();

			it( 'should return null for 622125', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '622125' ) );
			} );

			it( 'should return `discover` for 622126', function() {
				assert.equal( 'discover', creditCardDetails.getCreditCardType( '622126' ) );
			} );

			it( 'should return `discover` for ' + randomNumberBetweenRange + ' (a random number between 622126 and 622925)', function() {
				assert.equal( 'discover', creditCardDetails.getCreditCardType( randomNumberBetweenRange ) );
			} );

			it( 'should return `discover` for 622925', function() {
				assert.equal( 'discover', creditCardDetails.getCreditCardType( '622925' ) );
			} );

			it( 'should return null for 622926', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '622926' ) );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', function() {
			it( 'should return null for 2220990000000000', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '2220990000000000' ) );
			} );

			it( 'should return `mastercard` for 2221000000000000', function() {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '2221000000000000' ) );
			} );

			it( 'should return `mastercard` for 2720990000000000', function() {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '2720990000000000' ) );
			} );

			it( 'should return null for 2721000000000000', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '2721000000000000' ) );
			} );
		} );

		describe( 'Mastercard: range 51-55', function() {
			it( 'should return null for 5099999999999999', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '5099999999999999' ) );
			} );

			it( 'should return `mastercard` for 5100000000000000', function() {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '5599000000000000' ) );
			} );

			it( 'should return `mastercard` for 5599000000000000', function() {
				assert.equal( 'mastercard', creditCardDetails.getCreditCardType( '5599000000000000' ) );
			} );

			it( 'should return null for 5600000000000000', function() {
				assert.equal( null, creditCardDetails.getCreditCardType( '5600000000000000' ) );
			} );
		} );
	} );
} );
