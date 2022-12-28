import formatCurrency, { getCurrencyObject, setDefaultLocale } from '../src';

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

		const money2 = formatCurrency( 0, 'USD', { stripZeros: true } );
		expect( money2 ).toBe( '$0' );

		const money3 = formatCurrency( 0, 'EUR', { locale: 'en-US' } );
		expect( money3 ).toBe( '€0.00' );

		const money4 = formatCurrency( 0, 'EUR', { stripZeros: true } );
		expect( money4 ).toBe( '€0' );
	} );
	test( 'handles negative values', () => {
		const money = formatCurrency( -1234.56789, 'USD' );
		expect( money ).toBe( '-$1,234.57' );
	} );
	test( 'unknown currency codes return default', () => {
		const money = formatCurrency( 9800900.32, '' );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'formats a number to localized currency for smallest unit', () => {
		const money = formatCurrency( 9932, 'USD', { isSmallestUnit: true } );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'formats a number to localized currency for smallest unit for non-decimal currency', () => {
		const money = formatCurrency( 9932, 'JPY', { isSmallestUnit: true } );
		expect( money ).toBe( '¥9,932' );
	} );

	test( 'formats a rounded number if the number is a float and smallest unit is true', () => {
		const money = formatCurrency( 9932.1, 'USD', { isSmallestUnit: true } );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (USD)', () => {
		const money = formatCurrency( 9800900, 'USD', {} );
		expect( money ).toBe( '$9,800,900.00' );

		// Trailing zero cents should be removed.
		const money2 = formatCurrency( 9800900, 'USD', { stripZeros: true } );
		expect( money2 ).toBe( '$9,800,900' );

		// It should not strip non-zero cents.
		const money3 = formatCurrency( 9800900.32, 'USD', { stripZeros: true } );
		expect( money3 ).toBe( '$9,800,900.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (EUR)', () => {
		const money = formatCurrency( 9800900, 'EUR', { locale: 'de-DE' } );
		expect( money ).toBe( '9.800.900,00 €' );

		// Trailing zero cents should be removed.
		const money2 = formatCurrency( 9800900, 'EUR', { locale: 'de-DE', stripZeros: true } );
		expect( money2 ).toBe( '9.800.900 €' );

		// It should not strip non-zero cents.
		const money3 = formatCurrency( 9800900.32, 'EUR', { locale: 'de-DE', stripZeros: true } );
		expect( money3 ).toBe( '9.800.900,32 €' );
	} );

	describe( 'supported currencies', () => {
		beforeEach( () => {
			setDefaultLocale( undefined );
		} );

		test( 'USD', () => {
			const money = formatCurrency( 9800900.32, 'USD' );
			expect( money ).toBe( '$9,800,900.32' );
		} );
		test( 'USD in Canadian English', () => {
			const money = formatCurrency( 9800900.32, 'USD', { locale: 'en-CA' } );
			expect( money ).toBe( 'US$9,800,900.32' );
		} );
		test( 'AUD', () => {
			const money = formatCurrency( 9800900.32, 'AUD' );
			expect( money ).toBe( 'A$9,800,900.32' );
		} );
		test( 'CAD in Canadian English', () => {
			const money = formatCurrency( 9800900.32, 'CAD', { locale: 'en-CA' } );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in US English', () => {
			const money = formatCurrency( 9800900.32, 'CAD', { locale: 'en-US' } );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in Canadian French', () => {
			const money = formatCurrency( 9800900.32, 'CAD', { locale: 'fr-CA' } );
			expect( money ).toBe( '9 800 900,32 C$' );
		} );
		test( 'EUR in EN locale', () => {
			const money = formatCurrency( 9800900.32, 'EUR', { locale: 'en-US' } );
			expect( money ).toBe( '€9,800,900.32' );
		} );
		test( 'EUR in DE locale set by setDefaultLocale', () => {
			setDefaultLocale( 'de-DE' );
			const money = formatCurrency( 9800900.32, 'EUR' );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		test( 'EUR in DE locale', () => {
			const money = formatCurrency( 9800900.32, 'EUR', { locale: 'de-DE' } );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		test( 'EUR in FR locale', () => {
			const money = formatCurrency( 9800900.32, 'EUR', { locale: 'fr-FR' } );
			expect( money ).toBe( '9 800 900,32 €' );
		} );
		test( 'GBP', () => {
			const money = formatCurrency( 9800900.32, 'GBP' );
			expect( money ).toBe( '£9,800,900.32' );
		} );
		test( 'JPY', () => {
			const money = formatCurrency( 9800900.32, 'JPY' );
			expect( money ).toBe( '¥9,800,900' );
		} );
		test( 'BRL in EN locale', () => {
			const money = formatCurrency( 9800900.32, 'BRL', { locale: 'en-US' } );
			expect( money ).toBe( 'R$9,800,900.32' );
		} );
		test( 'BRL in PT locale', () => {
			const money = formatCurrency( 9800900.32, 'BRL', { locale: 'pt-BR' } );
			expect( money ).toBe( 'R$ 9.800.900,32' );
		} );
		test( 'IDR', () => {
			const money = formatCurrency( 107280000, 'IDR', { locale: 'in-ID', isSmallestUnit: true } );
			expect( money ).toBe( 'Rp 1.072.800,00' );
		} );
	} );

	describe( 'getCurrencyObject()', () => {
		test( 'handles zero', () => {
			const money = getCurrencyObject( 0, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '0',
				fraction: '.00',
				sign: '',
			} );
		} );
		test( 'handles negative values', () => {
			const money = getCurrencyObject( -1234.56789, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '1,234',
				fraction: '.57',
				sign: '-',
			} );
		} );
		test( 'handles values that round up', () => {
			const money = getCurrencyObject( 9.99876, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '10',
				fraction: '.00',
				sign: '',
			} );
		} );
		test( 'handles values that round down', () => {
			const money = getCurrencyObject( 9.99432, 'USD' );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9',
				fraction: '.99',
				sign: '',
			} );
		} );

		test( 'handles a number in the smallest unit', () => {
			const money = getCurrencyObject( 9932, 'USD', { isSmallestUnit: true } );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '99',
				fraction: '.32',
				sign: '',
			} );
		} );

		test( 'handles a number in the smallest unit for non-decimal currency', () => {
			const money = getCurrencyObject( 9932, 'JPY', { isSmallestUnit: true } );
			expect( money ).toEqual( {
				symbol: '¥',
				symbolPosition: 'before',
				integer: '9,932',
				fraction: '',
				sign: '',
			} );
		} );

		test( 'handles the number as rounded if the number is a float and smallest unit is set', () => {
			const money = getCurrencyObject( 9932.1, 'USD', { isSmallestUnit: true } );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '99',
				fraction: '.32',
				sign: '',
			} );
		} );

		describe( 'supported currencies', () => {
			test( 'USD', () => {
				const money = getCurrencyObject( 9800900.32, 'USD' );
				expect( money ).toEqual( {
					symbol: '$',
					symbolPosition: 'before',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'AUD', () => {
				const money = getCurrencyObject( 9800900.32, 'AUD' );
				expect( money ).toEqual( {
					symbol: 'A$',
					symbolPosition: 'before',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'CAD', () => {
				const money = getCurrencyObject( 9800900.32, 'CAD', { locale: 'en-US' } );
				expect( money ).toEqual( {
					symbol: 'C$',
					symbolPosition: 'before',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'EUR', () => {
				const money = getCurrencyObject( 9800900.32, 'EUR', { locale: 'de-DE' } );
				expect( money ).toEqual( {
					symbol: '€',
					symbolPosition: 'after',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
			test( 'GBP', () => {
				const money = getCurrencyObject( 9800900.32, 'GBP' );
				expect( money ).toEqual( {
					symbol: '£',
					symbolPosition: 'before',
					integer: '9,800,900',
					fraction: '.32',
					sign: '',
				} );
			} );
			test( 'JPY', () => {
				const money = getCurrencyObject( 9800900.32, 'JPY' );
				expect( money ).toEqual( {
					symbol: '¥',
					symbolPosition: 'before',
					integer: '9,800,900',
					fraction: '',
					sign: '',
				} );
			} );
			test( 'BRL', () => {
				const money = getCurrencyObject( 9800900.32, 'BRL', { locale: 'pt-BR' } );
				expect( money ).toEqual( {
					symbol: 'R$',
					symbolPosition: 'before',
					integer: '9.800.900',
					fraction: ',32',
					sign: '',
				} );
			} );
		} );
	} );
} );
