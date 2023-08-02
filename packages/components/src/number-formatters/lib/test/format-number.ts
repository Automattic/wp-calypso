/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import formatNumber from '../format-number';

describe( 'formatNumber', () => {
	it( 'formats numbers correctly according to the locale provided', () => {
		expect( formatNumber( 123.87, 'en-US', {} ) ).toStrictEqual( '123.87' );
		expect( formatNumber( 1234.87, 'en-US', {} ) ).toStrictEqual( '1,234.87' );
		expect( formatNumber( 12345.87, 'en-US', {} ) ).toStrictEqual( '12,345.87' );
		expect( formatNumber( 123456.87, 'en-US', {} ) ).toStrictEqual( '123,456.87' );
		expect( formatNumber( 1234567.87, 'en-US', {} ) ).toStrictEqual( '1,234,567.87' );
		expect( formatNumber( 12345678.87, 'en-US', {} ) ).toStrictEqual( '12,345,678.87' );
		expect( formatNumber( 123456789.87, 'en-US', {} ) ).toStrictEqual( '123,456,789.87' );
		expect( formatNumber( 123.87, 'de-DE', {} ) ).toStrictEqual( '123,87' );
		expect( formatNumber( 1234.87, 'de-DE', {} ) ).toStrictEqual( '1.234,87' );
		expect( formatNumber( 12345.87, 'de-DE', {} ) ).toStrictEqual( '12.345,87' );
		expect( formatNumber( 123456.87, 'de-DE', {} ) ).toStrictEqual( '123.456,87' );
		expect( formatNumber( 1234567.87, 'de-DE', {} ) ).toStrictEqual( '1.234.567,87' );
		expect( formatNumber( 12345678.87, 'de-DE', {} ) ).toStrictEqual( '12.345.678,87' );
		expect( formatNumber( 123456789.87, 'de-DE', {} ) ).toStrictEqual( '123.456.789,87' );
	} );

	const locales: [ string, number, string ][] = [
		[ 'de-DE', 123.87, '123,87' ],
		[ 'de-CH', 123.87, '123.87' ],
		[ 'pt-PT', 123.87, '123,87' ],
	];

	it.each( locales )( 'formats numbers correctly with locale %s', ( locale, value, expected ) => {
		expect( formatNumber( value, locale, {} ) ).toStrictEqual( expected );
	} );
} );
