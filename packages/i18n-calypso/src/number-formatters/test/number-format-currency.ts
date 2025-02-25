import { __DO_NOT_IMPORT__numberFormatCurrency } from '../number-format-currency';

const browserSafeLocale = 'en-US';

describe( '__DO_NOT_IMPORT__numberFormatCurrency default export', () => {
	test( 'formats a number to localized currency', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 99.32,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$99.32' );
	} );
} );

describe( '__DO_NOT_IMPORT__numberFormatCurrency', () => {
	test( 'formats a number to localized currency', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 99.32,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'adds a localized thousands separator', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale,
		} );

		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'handles zero', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 0,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$0.00' );

		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 0,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money2 ).toBe( '$0' );

		const money3 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 0,
			currency: 'EUR',
			browserSafeLocale,
		} );
		expect( money3 ).toBe( '€0.00' );

		const money4 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 0,
			currency: 'EUR',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money4 ).toBe( '€0' );
	} );

	test( 'handles negative values', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: -1234.56789,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '-$1,234.57' );
	} );

	test( 'unknown currency codes return default', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: '',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'unknown locale codes return default', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'foo-bar',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'formats a number to localized currency for smallest unit', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9932,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'formats a number to localized currency for smallest unit for non-decimal currency', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9932,
			currency: 'JPY',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '¥9,932' );
	} );

	test( 'formats a rounded number if the number is a float and smallest unit is true', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9932.1,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (USD)', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.00' );

		// Trailing zero cents should be removed.
		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money2 ).toBe( '$9,800,900' );

		// It should not strip non-zero cents.
		const money3 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money3 ).toBe( '$9,800,900.32' );
	} );

	test( 'returns no trailing zero cents when stripZeros set to true (EUR)', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
		} );
		expect( money ).toBe( '9.800.900,00 €' );

		// Trailing zero cents should be removed.
		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			stripZeros: true,
		} );
		expect( money2 ).toBe( '9.800.900 €' );

		// It should not strip non-zero cents.
		const money3 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			stripZeros: true,
		} );
		expect( money3 ).toBe( '9.800.900,32 €' );
	} );

	test( 'returns a plus sign for positive numbers if signForPositive is true (USD)', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.00' );

		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+$9,800,900.00' );
	} );

	test( 'returns a negative sign for negative numbers if signForPositive is true (USD)', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: -9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '-$9,800,900.00' );

		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: -9800900,
			currency: 'USD',
			browserSafeLocale,
			signForPositive: true,
		} );
		expect( money2 ).toBe( '-$9,800,900.00' );
	} );

	test( 'returns a plus sign for positive numbers if signForPositive is true (EUR)', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
		} );
		expect( money ).toBe( '9.800.900,00 €' );

		const money2 = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+9.800.900,00 €' );
	} );

	test( 'returns a number in latin numbers even for locales which default to other character sets', () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900,
			currency: 'INR',
			browserSafeLocale: 'mr-IN',
		} );
		expect( money ).toBe( '₹9,800,900.00' );
	} );

	test( 'sets USD currency symbol to $ if geolocation is US and locale is en', async () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en-US',
			geoLocation: 'US',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is US but locale is not en', async () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'fr',
			geoLocation: 'US',
		} );
		expect( money ).toBe( '9 800 900,32 $US' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is US but locale is an en variant', async () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en-CA',
			geoLocation: 'US',
		} );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	test( 'does not change USD currency symbol from $ if geolocation is unknown and locale is en', async () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en',
			geoLocation: '',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	test( 'sets USD currency symbol to US$ if geolocation is not US and locale is en', async () => {
		const money = __DO_NOT_IMPORT__numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en',
			geoLocation: 'CA',
		} );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	describe( 'specific currencies', () => {
		test( 'USD', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale,
			} );
			expect( money ).toBe( '$9,800,900.32' );
		} );
		test( 'USD in Canadian English', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale: 'en-CA',
			} );
			expect( money ).toBe( 'US$9,800,900.32' );
		} );
		test( 'AUD', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'AUD',
				browserSafeLocale,
			} );
			expect( money ).toBe( 'A$9,800,900.32' );
		} );
		test( 'CAD in Canadian English', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'en-CA',
			} );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in US English', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'en-US',
			} );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		test( 'CAD in Canadian French', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'fr-CA',
			} );
			expect( money ).toBe( '9 800 900,32 C$' );
		} );
		test( 'EUR in EN locale', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'en-US',
			} );
			expect( money ).toBe( '€9,800,900.32' );
		} );
		test( 'EUR in DE locale', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'de-DE',
			} );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		test( 'EUR in FR locale', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'fr-FR',
			} );
			expect( money ).toBe( '9 800 900,32 €' );
		} );
		test( 'GBP', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'GBP',
				browserSafeLocale,
			} );
			expect( money ).toBe( '£9,800,900.32' );
		} );
		test( 'JPY', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'JPY',
				browserSafeLocale,
			} );
			expect( money ).toBe( '¥9,800,900' );
		} );
		test( 'BRL in EN locale', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'BRL',
				browserSafeLocale,
			} );
			expect( money ).toBe( 'R$9,800,900.32' );
		} );
		test( 'BRL in PT locale', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 9800900.32,
				currency: 'BRL',
				browserSafeLocale: 'pt-BR',
			} );
			expect( money ).toBe( 'R$ 9.800.900,32' );
		} );
		test( 'IDR', () => {
			const money = __DO_NOT_IMPORT__numberFormatCurrency( {
				number: 107280000,
				currency: 'IDR',
				browserSafeLocale: 'in-ID',
				isSmallestUnit: true,
			} );
			expect( money ).toBe( 'Rp 1.072.800,00' );
		} );
	} );
} );
