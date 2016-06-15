/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import currencyFormatter, { findCurrency } from 'lib/currency-formatter';

describe( 'currencyFormatter', () => {
	it( 'formats a number to localized currency', () => {
		const money = currencyFormatter( 99.32, { code: 'USD' } );
		expect( money ).to.equal( '$99.32' );
	} );
	it( 'adds a localized thousands separator', () => {
		const money = currencyFormatter( 9800900.32, { code: 'USD' } );
		expect( money ).to.equal( '$9,800,900.32' );
	} );

	describe( 'supported currencies', () => {
		it( 'USD', () => {
			const money = currencyFormatter( 9800900.32, { code: 'USD' } );
			expect( money ).to.equal( '$9,800,900.32' );
		} );
		it( 'AUD', () => {
			const money = currencyFormatter( 9800900.32, { code: 'AUD' } );
			expect( money ).to.equal( 'A$9,800,900.32' );
		} );
		it( 'CAD', () => {
			const money = currencyFormatter( 9800900.32, { code: 'CAD' } );
			expect( money ).to.equal( 'C$9,800,900.32' );
		} );
		it( 'EUR', () => {
			const money = currencyFormatter( 9800900.32, { code: 'EUR' } );
			expect( money ).to.equal( '9.800.900,32 €' );
		} );
		it( 'GBP', () => {
			const money = currencyFormatter( 9800900.32, { code: 'GBP' } );
			expect( money ).to.equal( '£9,800,900.32' );
		} );
		it( 'JPY', () => {
			const money = currencyFormatter( 9800900.32, { code: 'JPY' } );
			expect( money ).to.equal( '¥9,800,900' );
		} );
	} );

	describe( 'findCurrency returns currency defaults', () => {
		it( 'returns Calypso symbol defaults', () => {
			const audDefaults = findCurrency( 'AUD' );
			expect( audDefaults ).to.eql( {
				code: 'AUD',
				symbol: 'A$', //originally $ in external lib
				thousandsSeparator: ',',
				decimalSeparator: '.',
				symbolOnLeft: true,
				spaceBetweenAmountAndSymbol: false,
				decimalDigits: 2
			} );
		} );
		it( 'returns Calypso thousand defaults', () => {
			const audDefaults = findCurrency( 'EUR' );
			expect( audDefaults ).to.eql( {
				code: 'EUR',
				symbol: '€',
				thousandsSeparator: '.', //originally a space in external lib
				decimalSeparator: ',',
				symbolOnLeft: false,
				spaceBetweenAmountAndSymbol: true,
				decimalDigits: 2
			} );
		} );
	} );
} );
