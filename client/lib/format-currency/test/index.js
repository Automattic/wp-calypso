/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import formatCurrency, { getCurrencyDefaults, getCurrencyObject } from 'lib/format-currency';

describe( 'formatCurrency', () => {
	it( 'formats a number to localized currency', () => {
		const money = formatCurrency( 99.32, 'USD' );
		expect( money ).to.equal( '$99.32' );
	} );
	it( 'adds a localized thousands separator', () => {
		const money = formatCurrency( 9800900.32, 'USD' );
		expect( money ).to.equal( '$9,800,900.32' );
	} );
	it( 'handles zero', () => {
		const money = formatCurrency( 0, 'USD' );
		expect( money ).to.equal( '$0.00' );
	} );
	it( 'handles negative values', () => {
		const money = formatCurrency( -1234.56789, 'USD' );
		expect( money ).to.equal( '-$1,234.57' );
	} );
	it( 'unknown currency codes return null', () => {
		const money = formatCurrency( 9800900.32, {} );
		expect( money ).to.equal( null );
	} );

	describe( 'supported currencies', () => {
		it( 'USD', () => {
			const money = formatCurrency( 9800900.32, 'USD' );
			expect( money ).to.equal( '$9,800,900.32' );
		} );
		it( 'AUD', () => {
			const money = formatCurrency( 9800900.32, 'AUD' );
			expect( money ).to.equal( 'A$9,800,900.32' );
		} );
		it( 'CAD', () => {
			const money = formatCurrency( 9800900.32, 'CAD' );
			expect( money ).to.equal( 'C$9,800,900.32' );
		} );
		it( 'EUR', () => {
			const money = formatCurrency( 9800900.32, 'EUR' );
			expect( money ).to.equal( '€9.800.900,32' );
		} );
		it( 'GBP', () => {
			const money = formatCurrency( 9800900.32, 'GBP' );
			expect( money ).to.equal( '£9,800,900.32' );
		} );
		it( 'JPY', () => {
			const money = formatCurrency( 9800900.32, 'JPY' );
			expect( money ).to.equal( '¥9,800,900' );
		} );
	} );

	describe( 'getCurrencyDefaults()', () => {
		it( 'returns currency defaults', () => {
			const audDefaults = getCurrencyDefaults( 'AUD' );
			expect( audDefaults ).to.eql( {
				symbol: 'A$',
				grouping: ',',
				decimal: '.',
				precision: 2
			} );
		} );
	} );

	describe( 'getCurrencyObject()', () => {
		it( 'handles zero', () => {
			const money = getCurrencyObject( 0, 'USD' );
			expect( money ).to.eql( {
				symbol: '$',
				integer: '0',
				fraction: '.00',
				sign: ''
			} );
		} );
		it( 'handles negative values', () => {
			const money = getCurrencyObject( -1234.56789, 'USD' );
			expect( money ).to.eql( {
				symbol: '$',
				integer: '1,234',
				fraction: '.57',
				sign: '-'
			} );
		} );
		describe( 'supported currencies', () => {
			it( 'USD', () => {
				const money = getCurrencyObject( 9800900.32, 'USD' );
				expect( money ).to.eql( {
					symbol: '$',
					integer: '9,800,900',
					fraction: '.32',
					sign: ''
				} );
			} );
			it( 'AUD', () => {
				const money = getCurrencyObject( 9800900.32, 'AUD' );
				expect( money ).to.eql( {
					symbol: 'A$',
					integer: '9,800,900',
					fraction: '.32',
					sign: ''
				} );
			} );
			it( 'CAD', () => {
				const money = getCurrencyObject( 9800900.32, 'CAD' );
				expect( money ).to.eql( {
					symbol: 'C$',
					integer: '9,800,900',
					fraction: '.32',
					sign: ''
				} );			} );
			it( 'EUR', () => {
				const money = getCurrencyObject( 9800900.32, 'EUR' );
				expect( money ).to.eql( {
					symbol: '€',
					integer: '9.800.900',
					fraction: ',32',
					sign: ''
				} );
			} );
			it( 'GBP', () => {
				const money = getCurrencyObject( 9800900.32, 'GBP' );
				expect( money ).to.eql( {
					symbol: '£',
					integer: '9,800,900',
					fraction: '.32',
					sign: ''
				} );
			} );
			it( 'JPY', () => {
				const money = getCurrencyObject( 9800900.32, 'JPY' );
				expect( money ).to.eql( {
					symbol: '¥',
					integer: '9,800,900',
					fraction: '',
					sign: ''
				} );
			} );
		} );
	} );
} );
