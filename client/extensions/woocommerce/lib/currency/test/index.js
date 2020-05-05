/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCurrencyFormatDecimal, getCurrencyFormatString } from '../index';

describe( 'getCurrencyFormatDecimal', () => {
	it( 'should be a function', () => {
		expect( getCurrencyFormatDecimal ).to.be.a( 'function' );
	} );

	it( 'should round a number to 2 decimal places in USD', () => {
		expect( getCurrencyFormatDecimal( 9.49258, 'USD' ) ).to.eql( 9.49 );
		expect( getCurrencyFormatDecimal( 30, 'USD' ) ).to.eql( 30 );
		expect( getCurrencyFormatDecimal( 3.0002, 'USD' ) ).to.eql( 3 );
	} );

	it( 'should round a number to 2 decimal places in GBP', () => {
		expect( getCurrencyFormatDecimal( 8.9272, 'GBP' ) ).to.eql( 8.93 );
		expect( getCurrencyFormatDecimal( 11, 'GBP' ) ).to.eql( 11 );
		expect( getCurrencyFormatDecimal( 7.0002, 'GBP' ) ).to.eql( 7 );
	} );

	it( 'should round a number to 0 decimal places in JPY', () => {
		expect( getCurrencyFormatDecimal( 1239.88, 'JPY' ) ).to.eql( 1240 );
		expect( getCurrencyFormatDecimal( 1500, 'JPY' ) ).to.eql( 1500 );
		expect( getCurrencyFormatDecimal( 33715.02, 'JPY' ) ).to.eql( 33715 );
	} );

	it( 'should correctly convert and round a string', () => {
		expect( getCurrencyFormatDecimal( '19.80', 'USD' ) ).to.eql( 19.8 );
	} );

	it( "should return 0 when given an input that isn't a number", () => {
		expect( getCurrencyFormatDecimal( 'abc', 'USD' ) ).to.eql( 0 );
		expect( getCurrencyFormatDecimal( false, 'USD' ) ).to.eql( 0 );
		expect( getCurrencyFormatDecimal( null, 'USD' ) ).to.eql( 0 );
	} );
} );

describe( 'getCurrencyFormatString', () => {
	it( 'should be a function', () => {
		expect( getCurrencyFormatString ).to.be.a( 'function' );
	} );

	it( 'should round a number to 2 decimal places in USD', () => {
		expect( getCurrencyFormatString( 9.49258, 'USD' ) ).to.eql( '9.49' );
		expect( getCurrencyFormatString( 30, 'USD' ) ).to.eql( '30.00' );
		expect( getCurrencyFormatString( 3.0002, 'USD' ) ).to.eql( '3.00' );
	} );

	it( 'should round a number to 2 decimal places in GBP', () => {
		expect( getCurrencyFormatString( 8.9272, 'GBP' ) ).to.eql( '8.93' );
		expect( getCurrencyFormatString( 11, 'GBP' ) ).to.eql( '11.00' );
		expect( getCurrencyFormatString( 7.0002, 'GBP' ) ).to.eql( '7.00' );
	} );

	it( 'should round a number to 0 decimal places in JPY', () => {
		expect( getCurrencyFormatString( 1239.88, 'JPY' ) ).to.eql( '1240' );
		expect( getCurrencyFormatString( 1500, 'JPY' ) ).to.eql( '1500' );
		expect( getCurrencyFormatString( 33715.02, 'JPY' ) ).to.eql( '33715' );
	} );

	it( 'should correctly convert and round a string', () => {
		expect( getCurrencyFormatString( '19.80', 'USD' ) ).to.eql( '19.80' );
	} );

	it( "should return empty string when given an input that isn't a number", () => {
		expect( getCurrencyFormatString( 'abc', 'USD' ) ).to.eql( '' );
		expect( getCurrencyFormatString( false, 'USD' ) ).to.eql( '' );
		expect( getCurrencyFormatString( null, 'USD' ) ).to.eql( '' );
	} );
} );
