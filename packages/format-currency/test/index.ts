import formatCurrency, { getCurrencyObject, createFormatter } from '../src';
import type { CurrencyFormatter } from '../src/types';

describe( 'formatCurrency default export', () => {
	test( 'formats a number to localized currency', () => {
		const money = formatCurrency( 99.32, 'USD' );
		expect( money ).toBe( '$99.32' );
	} );
} );

describe( 'getCurrencyObject default export', () => {
	test( 'handles negative values', () => {
		const money = getCurrencyObject( -1234.56789, 'USD' );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '1,234',
			fraction: '.57',
			sign: '-',
			hasNonZeroFraction: true,
		} );
	} );
} );

describe( 'formatCurrency', () => {
	let formatter: CurrencyFormatter;
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		globalThis.fetch = originalFetch;
		formatter = createFormatter();
	} );

	test( 'formats a number to localized currency', () => {
		const money = formatter.formatCurrency( 99.32, 'USD' );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'adds a localized thousands separator', () => {
		const money = formatter.formatCurrency( 9800900.32, 'USD' );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'handles zero', () => {
		const money = formatter.formatCurrency( 0, 'USD' );
		expect( money ).toBe( '$0.00' );

		const money2 = formatter.formatCurrency( 0, 'USD', { stripZeros: true } );
		expect( money2 ).toBe( '$0' );

		const money3 = formatter.formatCurrency( 0, 'EUR', { locale: 'en-US' } );
		expect( money3 ).toBe( '€0.00' );

		const money4 = formatter.formatCurrency( 0, 'EUR', { stripZeros: true } );
		expect( money4 ).toBe( '€0' );
	} );

	test( 'handles negative values', () => {
		const money = formatter.formatCurrency( -1234.56789, 'USD' );
		expect( money ).toBe( '-$1,234.57' );
	} );

	test( 'unknown currency codes return default', () => {
		const money = formatter.formatCurrency( 9800900.32, '' );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'unknown locale codes return default', () => {
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'foo-bar' } );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'formats a number to localized currency for smallest unit', () => {
		const money = formatter.formatCurrency( 9932, 'USD', { isSmallestUnit: true } );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'formats a number to localized currency for smallest unit for non-decimal currency', () => {
		const money = formatter.formatCurrency( 9932, 'JPY', { isSmallestUnit: true } );
		expect( money ).toBe( '¥9,932' );
	} );

	test( 'formats a rounded number if the number is a float and smallest unit is true', () => {
		const money = formatter.formatCurrency( 9932.1, 'USD', { isSmallestUnit: true } );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (USD)', () => {
		const money = formatter.formatCurrency( 9800900, 'USD', {} );
		expect( money ).toBe( '$9,800,900.00' );

		// Trailing zero cents should be removed.
		const money2 = formatter.formatCurrency( 9800900, 'USD', { stripZeros: true } );
		expect( money2 ).toBe( '$9,800,900' );

		// It should not strip non-zero cents.
		const money3 = formatter.formatCurrency( 9800900.32, 'USD', { stripZeros: true } );
		expect( money3 ).toBe( '$9,800,900.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (EUR)', () => {
		const money = formatter.formatCurrency( 9800900, 'EUR', { locale: 'de-DE' } );
		expect( money ).toBe( '9.800.900,00 €' );

		// Trailing zero cents should be removed.
		const money2 = formatter.formatCurrency( 9800900, 'EUR', {
			locale: 'de-DE',
			stripZeros: true,
		} );
		expect( money2 ).toBe( '9.800.900 €' );

		// It should not strip non-zero cents.
		const money3 = formatter.formatCurrency( 9800900.32, 'EUR', {
			locale: 'de-DE',
			stripZeros: true,
		} );
		expect( money3 ).toBe( '9.800.900,32 €' );
	} );

	test( 'returns a plus sign for positive numbers if signForPositive is true (USD)', () => {
		const money = formatter.formatCurrency( 9800900, 'USD', {} );
		expect( money ).toBe( '$9,800,900.00' );

		const money2 = formatter.formatCurrency( 9800900, 'USD', {
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+$9,800,900.00' );
	} );

	test( 'returns a negative sign for negative numbers if signForPositive is true (USD)', () => {
		const money = formatter.formatCurrency( -9800900, 'USD', {} );
		expect( money ).toBe( '-$9,800,900.00' );

		const money2 = formatter.formatCurrency( -9800900, 'USD', {
			signForPositive: true,
		} );
		expect( money2 ).toBe( '-$9,800,900.00' );
	} );

	test( 'returns a plus sign for positive numbers if signForPositive is true (EUR)', () => {
		const money = formatter.formatCurrency( 9800900, 'EUR', { locale: 'de-DE' } );
		expect( money ).toBe( '9.800.900,00 €' );

		const money2 = formatter.formatCurrency( 9800900, 'EUR', {
			locale: 'de-DE',
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+9.800.900,00 €' );
	} );

	test( 'returns a number in latin numbers even for locales which default to other character sets', () => {
		const money = formatter.formatCurrency( 9800900, 'INR', { locale: 'mr-IN' } );
		expect( money ).toBe( '₹9,800,900.00' );
	} );

	test( 'sets USD currency symbol to $ if geolocation is US and locale is en', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'US' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		formatter = createFormatter();
		await formatter.geolocateCurrencySymbol();
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'en-US' } );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is US but locale is not en', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'US' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		formatter = createFormatter();
		await formatter.geolocateCurrencySymbol();
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'fr' } );
		expect( money ).toBe( '9 800 900,32 $US' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is US but locale is an en variant', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'US' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		formatter = createFormatter();
		await formatter.geolocateCurrencySymbol();
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'en-CA' } );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	test( 'does not change USD currency symbol from $ if geolocation is unknown and locale is en', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: '' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		formatter = createFormatter();
		await formatter.geolocateCurrencySymbol();
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'en' } );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is not US and locale is en', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'CA' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		formatter = createFormatter();
		await formatter.geolocateCurrencySymbol();
		const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'en' } );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	describe( 'specific currencies', () => {
		test( 'USD', () => {
			const money = formatter.formatCurrency( 9800900.32, 'USD' );
			expect( money ).toBe( '$9,800,900.32' );
		} );
		test( 'USD in Canadian English', () => {
			const money = formatter.formatCurrency( 9800900.32, 'USD', { locale: 'en-CA' } );
			expect( money ).toBe( 'US$9,800,900.32' );
		} );
		test( 'AUD', () => {
			const money = formatter.formatCurrency( 9800900.32, 'AUD' );
			expect( money ).toBe( 'A$9,800,900.32' );
		} );
		test( 'CAD in Canadian English', () => {
			const money = formatter.formatCurrency( 9800900.32, 'CAD', { locale: 'en-CA' } );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in US English', () => {
			const money = formatter.formatCurrency( 9800900.32, 'CAD', { locale: 'en-US' } );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in Canadian French', () => {
			const money = formatter.formatCurrency( 9800900.32, 'CAD', { locale: 'fr-CA' } );
			expect( money ).toBe( '9 800 900,32 C$' );
		} );
		test( 'EUR in EN locale', () => {
			const money = formatter.formatCurrency( 9800900.32, 'EUR', { locale: 'en-US' } );
			expect( money ).toBe( '€9,800,900.32' );
		} );
		test( 'EUR in DE locale set by setDefaultLocale', () => {
			formatter.setDefaultLocale( 'de-DE' );
			const money = formatter.formatCurrency( 9800900.32, 'EUR' );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		test( 'EUR in DE locale', () => {
			const money = formatter.formatCurrency( 9800900.32, 'EUR', { locale: 'de-DE' } );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		test( 'EUR in FR locale', () => {
			const money = formatter.formatCurrency( 9800900.32, 'EUR', { locale: 'fr-FR' } );
			expect( money ).toBe( '9 800 900,32 €' );
		} );
		test( 'GBP', () => {
			const money = formatter.formatCurrency( 9800900.32, 'GBP' );
			expect( money ).toBe( '£9,800,900.32' );
		} );
		test( 'JPY', () => {
			const money = formatter.formatCurrency( 9800900.32, 'JPY' );
			expect( money ).toBe( '¥9,800,900' );
		} );
		test( 'BRL in EN locale', () => {
			const money = formatter.formatCurrency( 9800900.32, 'BRL', { locale: 'en-US' } );
			expect( money ).toBe( 'R$9,800,900.32' );
		} );
		test( 'BRL in PT locale', () => {
			const money = formatter.formatCurrency( 9800900.32, 'BRL', { locale: 'pt-BR' } );
			expect( money ).toBe( 'R$ 9.800.900,32' );
		} );
		test( 'DKK', () => {
			const money = formatter.formatCurrency( 107280000, 'DKK', {
				locale: 'da-DK',
				isSmallestUnit: true,
			} );
			expect( money ).toBe( '1.072.800,00 kr.' );
		} );
	} );
} );

describe( 'getCurrencyObject()', () => {
	let formatter: CurrencyFormatter;
	beforeEach( () => {
		formatter = createFormatter();
	} );

	test( 'handles zero', () => {
		const money = formatter.getCurrencyObject( 0, 'USD' );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '0',
			fraction: '.00',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	test( 'handles negative values', () => {
		const money = formatter.getCurrencyObject( -1234.56789, 'USD' );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '1,234',
			fraction: '.57',
			sign: '-',
			hasNonZeroFraction: true,
		} );
	} );

	test( 'handles values that round up', () => {
		const money = formatter.getCurrencyObject( 9.99876, 'USD' );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '10',
			fraction: '.00',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	test( 'handles values that round down', () => {
		const money = formatter.getCurrencyObject( 9.99432, 'USD' );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '9',
			fraction: '.99',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	test( 'handles a number in the smallest unit', () => {
		const money = formatter.getCurrencyObject( 9932, 'USD', { isSmallestUnit: true } );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '99',
			fraction: '.32',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	test( 'handles a number in the smallest unit for non-decimal currency', () => {
		const money = formatter.getCurrencyObject( 9932, 'JPY', { isSmallestUnit: true } );
		expect( money ).toEqual( {
			symbol: '¥',
			symbolPosition: 'before',
			integer: '9,932',
			fraction: '',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	test( 'handles the number as rounded if the number is a float and smallest unit is set', () => {
		const money = formatter.getCurrencyObject( 9932.1, 'USD', { isSmallestUnit: true } );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '99',
			fraction: '.32',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	describe( 'specific currencies', () => {
		test( 'USD', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'USD with signForPositive set', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'USD', { signForPositive: true } );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '+',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'USD with signForPositive set and negative number', () => {
			const money = formatter.getCurrencyObject( -9800900.32, 'USD', { signForPositive: true } );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '-',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'USD in Canadian English', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'USD', { locale: 'en-CA' } );
			expect( money ).toEqual( {
				symbol: 'US$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'AUD', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'AUD' );
			expect( money ).toEqual( {
				symbol: 'A$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'CAD', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'CAD', { locale: 'en-US' } );
			expect( money ).toEqual( {
				symbol: 'C$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'EUR', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'EUR', { locale: 'de-DE' } );
			expect( money ).toEqual( {
				symbol: '€',
				symbolPosition: 'after',
				integer: '9.800.900',
				fraction: ',32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'GBP', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'GBP' );
			expect( money ).toEqual( {
				symbol: '£',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'JPY', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'JPY' );
			expect( money ).toEqual( {
				symbol: '¥',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '',
				sign: '',
				hasNonZeroFraction: false,
			} );
		} );

		test( 'BRL', () => {
			const money = formatter.getCurrencyObject( 9800900.32, 'BRL', { locale: 'pt-BR' } );
			expect( money ).toEqual( {
				symbol: 'R$',
				symbolPosition: 'before',
				integer: '9.800.900',
				fraction: ',32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );
	} );
} );
describe( 'RTL currency formatting', () => {
	let formatter: CurrencyFormatter;

	beforeEach( () => {
		formatter = createFormatter();
	} );

	describe( 'formatCurrency in RTL', () => {
		test( 'prepends LRM (\u200E) to negative currency when isRtl is true', () => {
			const money = formatter.formatCurrency( -1234.56, 'USD', { isRtl: true } );
			expect( money ).toBe( '\u200E-$1,234.56' );
		} );

		test( 'prepends LRM (\u200E) to negative EUR currency when isRtl is true', () => {
			const money = formatter.formatCurrency( -1234.56, 'EUR', { locale: 'de-DE', isRtl: true } );
			expect( money ).toBe( '\u200E-1.234,56\u00a0€' );
		} );

		test( 'formats negative ILS in Hebrew with LRM to keep minus on left', () => {
			const money = formatter.formatCurrency( -16.8, 'ILS', { locale: 'he' } );
			expect( money ).toContain( '\u200E-' );
		} );

		test( 'prepends LRM (\u200E) to positive currency when signForPositive and isRtl are true', () => {
			const money = formatter.formatCurrency( 1234.56, 'USD', { signForPositive: true, isRtl: true } );
			expect( money ).toBe( '\u200E+$1,234.56' );
		} );

		test( 'does not add LRM to positive currency without sign in RTL', () => {
			const money = formatter.formatCurrency( 1234.56, 'USD', { isRtl: true } );
			expect( money ).toBe( '$1,234.56' );
		} );

		test( 'auto-detects document.dir = "rtl" in browser environment', () => {
			const originalDir = typeof document !== 'undefined' ? document.dir : undefined;
			try {
				if ( typeof document !== 'undefined' ) {
					document.dir = 'rtl';
				}
				const money = formatter.formatCurrency( -140, 'USD' );
				expect( money ).toBe( '\u200E-$140.00' );
			} finally {
				if ( typeof document !== 'undefined' && originalDir !== undefined ) {
					document.dir = originalDir;
				}
			}
		} );

		test( 'respects isRtl: false override even when document.dir is rtl', () => {
			const originalDir = typeof document !== 'undefined' ? document.dir : undefined;
			try {
				if ( typeof document !== 'undefined' ) {
					document.dir = 'rtl';
				}
				const money = formatter.formatCurrency( -140, 'USD', { isRtl: false } );
				expect( money ).toBe( '-$140.00' );
			} finally {
				if ( typeof document !== 'undefined' && originalDir !== undefined ) {
					document.dir = originalDir;
				}
			}
		} );
	} );

	describe( 'getCurrencyObject in RTL', () => {
		test( 'returns \u200E- sign when isRtl is true', () => {
			const money = formatter.getCurrencyObject( -1234.56, 'USD', { isRtl: true } );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '1,234',
				fraction: '.56',
				sign: '\u200E-',
				hasNonZeroFraction: true,
			} );
		} );

		test( 'returns \u200E- sign for Hebrew locale', () => {
			const money = formatter.getCurrencyObject( -16.8, 'ILS', { locale: 'he' } );
			expect( money.sign ).toBe( '\u200E-' );
		} );

		test( 'returns \u200E+ sign when signForPositive and isRtl are true', () => {
			const money = formatter.getCurrencyObject( 1234.56, 'USD', { signForPositive: true, isRtl: true } );
			expect( money.sign ).toBe( '\u200E+' );
		} );

		test( 'auto-detects document.dir = "rtl" for getCurrencyObject', () => {
			const originalDir = typeof document !== 'undefined' ? document.dir : undefined;
			try {
				if ( typeof document !== 'undefined' ) {
					document.dir = 'rtl';
				}
				const money = formatter.getCurrencyObject( -140, 'USD' );
				expect( money.sign ).toBe( '\u200E-' );
			} finally {
				if ( typeof document !== 'undefined' && originalDir !== undefined ) {
					document.dir = originalDir;
				}
			}
		} );

		test( 'returns standard minus sign in LTR', () => {
			const money = formatter.getCurrencyObject( -140, 'USD', { isRtl: false } );
			expect( money.sign ).toBe( '-' );
		} );
	} );
} );
