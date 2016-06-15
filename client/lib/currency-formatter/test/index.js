/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import currencyFormatter, { getCurrencyDefaults, getCurrencyObject } from 'lib/currency-formatter';

describe( 'currencyFormatter', () => {
	it( 'formats a number to localized currency', () => {
		const money = currencyFormatter( 99.32, { code: 'USD' } );
		expect( money ).to.equal( '$99.32' );
	} );
	it( 'adds a localized thousands separator', () => {
		const money = currencyFormatter( 9800900.32, { code: 'USD' } );
		expect( money ).to.equal( '$9,800,900.32' );
	} );
	it( 'handles zero', () => {
		const money = currencyFormatter( 0, { code: 'USD' } );
		expect( money ).to.equal( '$0.00' );
	} );
	it( 'handles negative values', () => {
		const money = currencyFormatter( -1234.56789, { code: 'USD' } );
		expect( money ).to.equal( '-$1,234.57' );
	} );
	it( 'unknown currency codes return null', () => {
		const money = currencyFormatter( 9800900.32, {} );
		expect( money ).to.equal( null );
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
			expect( money ).to.equal( '€9.800.900,32' );
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

	describe( 'getCurrencyDefaults()', () => {
		it( 'returns currency defaults', () => {
			const audDefaults = getCurrencyDefaults( 'AUD' );
			expect( audDefaults ).to.eql( {
				code: 'AUD',
				symbol: 'A$',
				grouping: ',',
				decimal: '.',
				precision: 2
			} );
		} );
	} );

	describe( 'getCurrencyObject()', () => {
		it( 'handles zero', () => {
			const money = getCurrencyObject( 0, { code: 'USD' } );
			expect( money ).to.eql( {
				symbol: '$',
				dollars: '0',
				cents: '.00',
				sign: ''
			} );
		} );
		it( 'handles negative values', () => {
			const money = getCurrencyObject( -1234.56789, { code: 'USD' } );
			expect( money ).to.eql( {
				symbol: '$',
				dollars: '1,234',
				cents: '.57',
				sign: '-'
			} );
		} );
		describe( 'supported currencies', () => {
			it( 'USD', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'USD' } );
				expect( money ).to.eql( {
					symbol: '$',
					dollars: '9,800,900',
					cents: '.32',
					sign: ''
				} );
			} );
			it( 'AUD', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'AUD' } );
				expect( money ).to.eql( {
					symbol: 'A$',
					dollars: '9,800,900',
					cents: '.32',
					sign: ''
				} );
			} );
			it( 'CAD', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'CAD' } );
				expect( money ).to.eql( {
					symbol: 'C$',
					dollars: '9,800,900',
					cents: '.32',
					sign: ''
				} );			} );
			it( 'EUR', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'EUR' } );
				expect( money ).to.eql( {
					symbol: '€',
					dollars: '9.800.900',
					cents: ',32',
					sign: ''
				} );
			} );
			it( 'GBP', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'GBP' } );
				expect( money ).to.eql( {
					symbol: '£',
					dollars: '9,800,900',
					cents: '.32',
					sign: ''
				} );
			} );
			it( 'JPY', () => {
				const money = getCurrencyObject( 9800900.32, { code: 'JPY' } );
				expect( money ).to.eql( {
					symbol: '¥',
					dollars: '9,800,900',
					cents: '',
					sign: ''
				} );
			} );
		} );
	} );
} );
