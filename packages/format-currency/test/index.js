/**
 * Internal dependencies
 */
import formatCurrency, { getCurrencyDefaults, getCurrencyObject } from '../src';

describe( 'formatCurrency', () => {
	test( 'formats a number to localized currency', () => {
		const money = formatCurrency( 99.32, 'USD' );
		expect( money ).toBe( '$99.32' );
	} );
	test( 'adds a localized thousands separator', () => {
		const money = formatCurrency( 9800900.32, 'USD' );
		expect( money ).toBe( '$9,800,900.32' );
	} );
	test( 'handles zero', () => {
		const money = formatCurrency( 0, 'USD' );
		expect( money ).toBe( '$0.00' );
	} );
	test( 'handles negative values', () => {
		const money = formatCurrency( -1234.56789, 'USD' );
		expect( money ).toBe( '-$1,234.57' );
	} );
	test( 'unknown currency codes return default', () => {
		const money = formatCurrency( 9800900.32, {} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	describe( 'supported currencies', () => {
		test( 'USD', () => {
			const money = formatCurrency( 9800900.32, 'USD' );
			expect( money ).toBe( '$9,800,900.32' );
		} );
		test( 'AUD', () => {
			const money = formatCurrency( 9800900.32, 'AUD' );
			expect( money ).toBe( 'A$9,800,900.32' );
		} );
		test( 'CAD', () => {
			const money = formatCurrency( 9800900.32, 'CAD' );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'EUR', () => {
			const money = formatCurrency( 9800900.32, 'EUR' );
			expect( money ).toBe( '€9.800.900,32' );
		} );
		test( 'GBP', () => {
			const money = formatCurrency( 9800900.32, 'GBP' );
			expect( money ).toBe( '£9,800,900.32' );
		} );
		test( 'JPY', () => {
			const money = formatCurrency( 9800900.32, 'JPY' );
			expect( money ).toBe( '¥9,800,900' );
		} );
		test( 'BRL', () => {
			const money = formatCurrency( 9800900.32, 'BRL' );
			expect( money ).toBe( 'R$9.800.900,32' );
		} );
	} );

	describe( 'getCurrencyDefaults()', () => {
		test( 'returns currency defaults', () => {
			const audDefaults = getCurrencyDefaults( 'AUD' );
			expect( audDefaults ).toEqual( {
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
			expect( money ).toEqual( {
				symbol: '$',
				integer: '0',
				fraction: '.00',
				sign: '',
			} );
		} );
		test( 'handles negative values', () => {
			const money = getCurrencyObject( -1234.56789, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				integer: '1,234',
				fraction: '.57',
				sign: '-',
			} );
		} );
		describe( 'supported currencies', () => {
			test( 'USD', () => {
				const money = getCurrencyObject( 9800900.32, 'USD' );
				expect( money ).toEqual( {
					symbol: '$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'AUD', () => {
				const money = getCurrencyObject( 9800900.32, 'AUD' );
				expect( money ).toEqual( {
					symbol: 'A$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'CAD', () => {
				const money = getCurrencyObject( 9800900.32, 'CAD' );
				expect( money ).toEqual( {
					symbol: 'C$',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'EUR', () => {
				const money = getCurrencyObject( 9800900.32, 'EUR' );
				expect( money ).toEqual( {
					symbol: '€',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
			test( 'GBP', () => {
				const money = getCurrencyObject( 9800900.32, 'GBP' );
				expect( money ).toEqual( {
					symbol: '£',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'JPY', () => {
				const money = getCurrencyObject( 9800900.32, 'JPY' );
				expect( money ).toEqual( {
					symbol: '¥',
					integer: '9,800,900',
					fraction: '',
					sign: '',
				} );
			} );
			test( 'BRL', () => {
				const money = getCurrencyObject( 9800900.32, 'BRL' );
				expect( money ).toEqual( {
					symbol: 'R$',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
		} );
	} );
} );
