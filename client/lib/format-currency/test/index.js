/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import formatCurrency, { getCurrencyDefaults, getCurrencyObject } from 'lib/format-currency';

describe( 'formatCurrency', () => {
	test( 'formats a number to localized currency', () => {
		const money = formatCurrency( 99.32, 'USD' );
		expect( money ).to.equal( '$99.32' );
	} );
	test( 'adds a localized thousands separator', () => {
		const money = formatCurrency( 9800900.32, 'USD' );
		expect( money ).to.equal( '$9,800,900.32' );
	} );
	test( 'handles zero', () => {
		const money = formatCurrency( 0, 'USD' );
		expect( money ).to.equal( '$0.00' );
	} );
	test( 'handles negative values', () => {
		const money = formatCurrency( -1234.56789, 'USD' );
		expect( money ).to.equal( '-$1,234.57' );
	} );
	test( 'unknown currency codes return default', () => {
		const money = formatCurrency( 9800900.32, {} );
		expect( money ).to.equal( '$9,800,900.32' );
	} );

	describe( 'supported currencies', () => {
		test( 'USD', () => {
			const money = formatCurrency( 9800900.32, 'USD' );
			expect( money ).to.equal( '$9,800,900.32' );
		} );
		test( 'AUD', () => {
			const money = formatCurrency( 9800900.32, 'AUD' );
			expect( money ).to.equal( 'A$9,800,900.32' );
		} );
		test( 'CAD', () => {
			const money = formatCurrency( 9800900.32, 'CAD' );
			expect( money ).to.equal( 'C$9,800,900.32' );
		} );
		test( 'EUR', () => {
			const money = formatCurrency( 9800900.32, 'EUR' );
			expect( money ).to.equal( '€9.800.900,32' );
		} );
		test( 'GBP', () => {
			const money = formatCurrency( 9800900.32, 'GBP' );
			expect( money ).to.equal( '£9,800,900.32' );
		} );
		test( 'JPY', () => {
			const money = formatCurrency( 9800900.32, 'JPY' );
			expect( money ).to.equal( '¥9,800,900' );
		} );
		test( 'BRL', () => {
			const money = formatCurrency( 9800900.32, 'BRL' );
			expect( money ).to.equal( 'R$9.800.900,32' );
		} );
	} );

	describe( 'getCurrencyDefaults()', () => {
		test( 'returns currency defaults', () => {
			const audDefaults = getCurrencyDefaults( 'AUD' );
			expect( audDefaults ).to.eql( {
				symbol: 'A$',
				grouping: ',',
				decimal: '.',
				precision: 2,
			} );
		} );
	} );

	describe( 'getCurrencyObject()', () => {
		test( 'handles zero', () => {
			const money = getCurrencyObject( 0, 'USD' );
			expect( money ).to.eql( {
				symbol: '$',
				integer: '0',
				fraction: '.00',
				sign: '',
			} );
		} );
		test( 'handles negative values', () => {
			const money = getCurrencyObject( -1234.56789, 'USD' );
			expect( money ).to.eql( {
				symbol: '$',
				integer: '1,234',
				fraction: '.57',
				sign: '-',
			} );
		} );
		describe( 'supported currencies', () => {
			test( 'USD', () => {
				const money = getCurrencyObject( 9800900.32, 'USD' );
				expect( money ).to.eql( {
					symbol: '$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'AUD', () => {
				const money = getCurrencyObject( 9800900.32, 'AUD' );
				expect( money ).to.eql( {
					symbol: 'A$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'CAD', () => {
				const money = getCurrencyObject( 9800900.32, 'CAD' );
				expect( money ).to.eql( {
					symbol: 'C$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'EUR', () => {
				const money = getCurrencyObject( 9800900.32, 'EUR' );
				expect( money ).to.eql( {
					symbol: '€',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
			test( 'GBP', () => {
				const money = getCurrencyObject( 9800900.32, 'GBP' );
				expect( money ).to.eql( {
					symbol: '£',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'JPY', () => {
				const money = getCurrencyObject( 9800900.32, 'JPY' );
				expect( money ).to.eql( {
					symbol: '¥',
					integer: '9,800,900',
					fraction: '',
					sign: '',
				} );
			} );
			test( 'BRL', () => {
				const money = getCurrencyObject( 9800900.32, 'BRL' );
				expect( money ).to.eql( {
					symbol: 'R$',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
		} );
	} );
} );
