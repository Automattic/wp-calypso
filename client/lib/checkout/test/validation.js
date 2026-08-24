/**
 * @jest-environment jsdom
 */

import { getCreditCardType } from '../validation';

describe( 'validation', () => {
	describe( 'getCreditCardType', () => {
		describe( 'Discover Card: starts with 6011, 64, 65', () => {
			test( 'should not return Discover for 622125', () => {
				expect( getCreditCardType( '622125' ) ).not.toEqual( 'discover' );
			} );
			test( 'should return `discover` for 6011000990139424', () => {
				expect( getCreditCardType( '6011000990139424' ) ).toEqual( 'discover' );
			} );

			test( 'should return `discover` for 6445644564456445', () => {
				expect( getCreditCardType( '6445644564456445' ) ).toEqual( 'discover' );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', () => {
			test( 'should return `mastercard` for 2221000000000000', () => {
				expect( getCreditCardType( '2221000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 2720990000000000', () => {
				expect( getCreditCardType( '2720990000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 2223003122003222', () => {
				expect( getCreditCardType( '2223003122003222' ) ).toEqual( 'mastercard' );
			} );
		} );

		describe( 'Mastercard: range 51-55', () => {
			test( 'should not return mastercard for 5099999999999999', () => {
				expect( getCreditCardType( '5099999999999999' ) ).not.toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 5100000000000000', () => {
				expect( getCreditCardType( '5100000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 5599000000000000', () => {
				expect( getCreditCardType( '5599000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should not return mastercard for 5600000000000000', () => {
				expect( getCreditCardType( '5600000000000000' ) ).not.toEqual( 'mastercard' );
			} );
		} );

		describe( 'American Express', () => {
			test( 'should return `amex` for 370000000000002', () => {
				expect( getCreditCardType( '370000000000002' ) ).toEqual( 'amex' );
			} );

			test( 'should return `amex` for 378282246310005', () => {
				expect( getCreditCardType( '378282246310005' ) ).toEqual( 'amex' );
			} );
		} );

		describe( 'Visa', () => {
			test( 'should return `visa` for 4242424242424242', () => {
				expect( getCreditCardType( '4242424242424242' ) ).toEqual( 'visa' );
			} );

			test( 'should return `visa` for 4000000400000008', () => {
				expect( getCreditCardType( '4000000400000008' ) ).toEqual( 'visa' );
			} );
		} );

		describe( 'Other Brands', () => {
			test( 'should return `jcb` for 3530111333300000', () => {
				expect( getCreditCardType( '3530111333300000' ) ).toEqual( 'jcb' );
			} );

			test( 'should return `diners` for 30569309025904', () => {
				expect( getCreditCardType( '30569309025904' ) ).toEqual( 'diners' );
			} );

			test( 'should return `diners` for 38520000023237', () => {
				expect( getCreditCardType( '38520000023237' ) ).toEqual( 'diners' );
			} );

			test( 'should return `unionpay` for 6240008631401148', () => {
				expect( getCreditCardType( '6240008631401148' ) ).toEqual( 'unionpay' );
			} );
		} );
	} );
} );
