/**
 * @jest-environment jsdom
 */

import {
	__DO_NOT_IMPORT__numberFormat as numberFormat,
	__DO_NOT_IMPORT__numberFormatCompact as numberFormatCompact,
} from '../index';

describe( 'numberFormat', () => {
	it( 'should format number with default options', () => {
		const result = numberFormat( { number: 1234.56, browserSafeLocale: 'en-US' } );
		expect( result ).toBe( '1,235' );
	} );

	it( 'should format number with specified decimals', () => {
		const result = numberFormat( { number: 1234.56, browserSafeLocale: 'en-US', decimals: 2 } );
		expect( result ).toBe( '1,234.56' );
	} );

	it( 'should format number with forceLatin set to false', () => {
		const result = numberFormat( {
			number: 1234.56,
			browserSafeLocale: 'ar-EG',
			forceLatin: false,
		} );
		expect( result ).toBe( '١٬٢٣٥' );
	} );

	it( 'should format number with custom numberFormatOptions', () => {
		const result = numberFormat( {
			number: 1234.56,
			browserSafeLocale: 'en-US',
			numberFormatOptions: { style: 'currency', currency: 'USD' },
		} );
		expect( result ).toBe( '$1,235' );
	} );

	it( 'should return original number as string if formatting fails', () => {
		// mock `Intl.NumberFormat` to throw an error
		const originalIntlNumberFormat = Intl.NumberFormat;
		( Intl as any ).NumberFormat = jest.fn().mockImplementation( () => {
			throw new Error( 'Invalid locale' );
		} );

		const result = numberFormat( {
			number: 1234.56,
			browserSafeLocale: 'en',
		} );
		expect( result ).toBe( '1234.56' );

		// restore original `Intl.NumberFormat`
		( Intl as any ).NumberFormat = originalIntlNumberFormat;
	} );
} );

describe( 'numberFormatCompact', () => {
	it( 'should format number in compact notation', () => {
		const result = numberFormatCompact( { number: 1234567, browserSafeLocale: 'en-US' } );
		expect( result ).toBe( '1.2M' );
	} );

	it( 'should format number in compact notation with custom maximumFractionDigits', () => {
		const result = numberFormatCompact( {
			number: 1234567,
			browserSafeLocale: 'en-US',
			numberFormatOptions: { maximumFractionDigits: 2 },
		} );
		expect( result ).toBe( '1.23M' );
	} );

	it( 'should format number in compact notation with forceLatin set to false', () => {
		const result = numberFormatCompact( {
			number: 1234567,
			browserSafeLocale: 'ar-EG',
			forceLatin: false,
		} );
		expect( result ).toBe( '١٫٢ مليون' );
	} );

	it( 'should return original number as string if formatting fails', () => {
		// mock `Intl.NumberFormat` to throw an error
		const originalIntlNumberFormat = Intl.NumberFormat;
		( Intl as any ).NumberFormat = jest.fn().mockImplementation( () => {
			throw new Error( 'Invalid locale' );
		} );
		const result = numberFormatCompact( { number: 1234567, browserSafeLocale: 'invalid-locale' } );
		expect( result ).toBe( '1234567' );

		// restore original `Intl.NumberFormat`
		( Intl as any ).NumberFormat = originalIntlNumberFormat;
	} );
} );
