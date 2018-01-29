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

describe( 'index', () => {
	describe( 'Validation', () => {
		describe( 'Discover Card: starts with 6011, 64, 65', () => {
			test( 'should not return Discover for 622125', () => {
				assert.notEqual( getCreditCardType( '622125' ), 'discover' );
			} );
			test( 'should return `discover` for 6011000990139424', () => {
				assert.equal( getCreditCardType( '6011000990139424' ), 'discover' );
			} );

			test( 'should return `discover` for 6445644564456445', () => {
				assert.equal( getCreditCardType( '6445644564456445' ), 'discover' );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', () => {
			test( 'should return `mastercard` for 2221000000000000', () => {
				assert.equal( getCreditCardType( '2221000000000000' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 2720990000000000', () => {
				assert.equal( getCreditCardType( '2720990000000000' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 2223003122003222', () => {
				assert.equal( getCreditCardType( '2223003122003222' ), 'mastercard' );
			} );
		} );

		describe( 'Mastercard: range 51-55', () => {
			test( 'should not return mastercard for 5099999999999999', () => {
				assert.notEqual( getCreditCardType( '5099999999999999' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 5100000000000000', () => {
				assert.equal( getCreditCardType( '5599000000000000' ), 'mastercard' );
			} );

			test( 'should return `mastercard` for 5599000000000000', () => {
				assert.equal( getCreditCardType( '5599000000000000' ), 'mastercard' );
			} );

			test( 'should not return mastercard for 5600000000000000', () => {
				assert.notEqual( getCreditCardType( '5600000000000000' ), 'mastercard' );
			} );
		} );

		describe( 'American Express', () => {
			test( 'should return `amex` for 370000000000002', () => {
				assert.equal( getCreditCardType( '370000000000002' ), 'amex' );
			} );

			test( 'should return `amex` for 378282246310005', () => {
				assert.equal( getCreditCardType( '378282246310005' ), 'amex' );
			} );
		} );

		describe( 'Visa', () => {
			test( 'should return `visa` for 4242424242424242', () => {
				assert.equal( getCreditCardType( '4242424242424242' ), 'visa' );
			} );

			test( 'should return `visa` for 4000000400000008', () => {
				assert.equal( getCreditCardType( '4000000400000008' ), 'visa' );
			} );
		} );

		describe( 'Other Brands', () => {
			test( 'should return `jcb` for 3530111333300000', () => {
				assert.equal( getCreditCardType( '3530111333300000' ), 'jcb' );
			} );

			test( 'should return `diners` for 30569309025904', () => {
				assert.equal( getCreditCardType( '30569309025904' ), 'diners' );
			} );

			test( 'should return `diners` for 38520000023237', () => {
				assert.equal( getCreditCardType( '38520000023237' ), 'diners' );
			} );

			test( 'should return `unionpay` for 6240008631401148', () => {
				assert.equal( getCreditCardType( '6240008631401148' ), 'unionpay' );
			} );
		} );
	} );
} );
