/**
 * @jest-environment jsdom
 */

import i18n from '../src';
import data from './data';
import type { NumberFormatOptions } from '../types';

const testNumber = 1234567.89;
const iterations = 100000;

function benchmarkNumberFormat( options: NumberFormatOptions ) {
	// use a variety of options to mimick common usage
	const numberFormatOptions = {
		minimumFractionDigits: 1,
		maximumFractionDigits: 3,
		style: 'currency',
		currency: 'USD',
		useGrouping: true,
		notation: 'compact',
	};

	const start = Date.now();
	for ( let i = 0; i < iterations; i++ ) {
		i18n.numberFormat( testNumber, { ...options, numberFormatOptions } );
	}
	const end = Date.now();
	return end - start;
}

describe( 'numberFormat caching strategies', () => {
	beforeEach( function () {
		i18n.setLocale( data.locale );
	} );

	afterEach( function () {
		jest.clearAllMocks();
		i18n.configure(); // ensure everything is reset
	} );

	it( 'each caching method returns correct results', () => {
		expect(
			i18n.numberFormat( testNumber, {
				caching: 'custom',
			} )
		).toEqual( '1.234.568' );

		expect(
			i18n.numberFormat( testNumber, {
				caching: 'stringify',
			} )
		).toEqual( '1.234.568' );

		expect(
			i18n.numberFormat( testNumber, {
				caching: 'none',
			} )
		).toEqual( '1.234.568' );
	} );

	it( 'should benchmark caching', () => {
		const customCacheTime = benchmarkNumberFormat( { caching: 'custom' } );
		const stringifyCacheTime = benchmarkNumberFormat( { caching: 'stringify' } );
		const noCacheTime = benchmarkNumberFormat( { caching: 'none' } );

		// eslint-disable-next-line no-console
		console.log(
			`custom: ${ customCacheTime }, json.stringify: ${ stringifyCacheTime }, none: ${ noCacheTime }`
		);

		expect( noCacheTime ).toBeGreaterThan( stringifyCacheTime );
		expect( stringifyCacheTime ).toBeGreaterThan( customCacheTime );
	} );
} );
