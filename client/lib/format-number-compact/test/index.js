/** @format */

/**
 * Internal dependencies
 */
import formatNumberCompact, { formatNumberMetric } from 'lib/format-number-compact';

describe( 'formatNumberCompact', () => {
	test( 'does nothing if number is < 1000', () => {
		const counts = formatNumberCompact( 999, 'en' );
		expect( counts ).toEqual( '999' );
	} );
	test( 'shows 2 sig figs for counts < 10000', () => {
		const counts = formatNumberCompact( 1234, 'en' );
		expect( counts ).toEqual( '1.2K' );
	} );
	test( 'shows leading sig figs for counts > 10000', () => {
		const counts = formatNumberCompact( 123456, 'en' );
		expect( counts ).toEqual( '123K' );
	} );
	test( 'rounds abbreviated counts', () => {
		const counts = formatNumberCompact( 1897, 'en' );
		expect( counts ).toEqual( '1.9K' );
	} );
	test( 'shows groupings for huge numbers', () => {
		const counts = formatNumberCompact( 123456789, 'en' );
		expect( counts ).toEqual( '123,457K' );
	} );
	test( 'handles negative numbers', () => {
		const counts = formatNumberCompact( -123456789, 'en' );
		expect( counts ).toEqual( '-123,457K' );
	} );
	describe( 'es', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'es' );
			expect( counts ).toEqual( '1,2 mil' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'es' );
			expect( counts ).toEqual( '123 mil' );
		} );
	} );
	describe( 'pt-br', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'pt-br' );
			expect( counts ).toEqual( '1,2 mil' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'pt-br' );
			expect( counts ).toEqual( '123 mil' );
		} );
	} );
	describe( 'de', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'de' );
			expect( counts ).toEqual( '1,2 Tsd.' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'de' );
			expect( counts ).toEqual( '123 Tsd.' );
		} );
	} );
	describe( 'fr', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'fr' );
			expect( counts ).toEqual( '1,2 k' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'fr' );
			expect( counts ).toEqual( '123 k' );
		} );
	} );
	describe( 'he', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'he' );
			expect( counts ).toEqual( '1.2K' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'he' );
			expect( counts ).toEqual( '123K' );
		} );
	} );
	describe( 'ja', () => {
		test( 'does not modify counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'ja' );
			expect( counts ).toEqual( '1234' );
		} );
		test( 'shows 2 sig figs for counts just over 10000', () => {
			const counts = formatNumberCompact( 12345, 'ja' );
			expect( counts ).toEqual( '1.2万' );
		} );
		test( 'shows leading sig figs for counts > 100000', () => {
			const counts = formatNumberCompact( 1234567, 'ja' );
			expect( counts ).toEqual( '123万' );
		} );
	} );
	describe( 'it', () => {
		test( 'does not support a compact format, use numberFormat directly from i18n', () => {
			const counts = formatNumberCompact( 1234, 'it' );
			expect( counts ).toEqual( null );
		} );
	} );
	describe( 'nl', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'nl' );
			expect( counts ).toEqual( '1,2K' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'nl' );
			expect( counts ).toEqual( '123K' );
		} );
	} );
	describe( 'ru', () => {
		test( 'the short form is too long to be useful, use numberFormat directly from i18n', () => {
			const counts = formatNumberCompact( 1234, 'ru' );
			expect( counts ).toEqual( null );
		} );
	} );
	describe( 'tr', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'tr' );
			expect( counts ).toEqual( '1,2 B' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'tr' );
			expect( counts ).toEqual( '123 B' );
		} );
	} );
	describe( 'id', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'id' );
			expect( counts ).toEqual( '1,2 rb' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'id' );
			expect( counts ).toEqual( '123 rb' );
		} );
	} );
	describe( 'zh-cn', () => {
		test( 'does not modify counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'zh-cn' );
			expect( counts ).toEqual( '1234' );
		} );
		test( 'shows 2 sig figs for counts just over 10000', () => {
			const counts = formatNumberCompact( 12345, 'zh-cn' );
			expect( counts ).toEqual( '1.2万' );
		} );
		test( 'shows leading sig figs for counts > 100000', () => {
			const counts = formatNumberCompact( 1234567, 'zh-cn' );
			expect( counts ).toEqual( '123万' );
		} );
	} );
	describe( 'zh-tw', () => {
		test( 'does not modify counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'zh-tw' );
			expect( counts ).toEqual( '1234' );
		} );
		test( 'shows 2 sig figs for counts just over 10000', () => {
			const counts = formatNumberCompact( 12345, 'zh-tw' );
			expect( counts ).toEqual( '1.2萬' );
		} );
		test( 'shows leading sig figs for counts > 100000', () => {
			const counts = formatNumberCompact( 1234567, 'zh-tw' );
			expect( counts ).toEqual( '123萬' );
		} );
	} );
	describe( 'ko', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'ko' );
			expect( counts ).toEqual( '1.2천' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'ko' );
			expect( counts ).toEqual( '123천' );
		} );
	} );
	describe( 'ar', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'ar' );
			expect( counts ).toEqual( '1٫2 ألف' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'ar' );
			expect( counts ).toEqual( '123 ألف' );
		} );
	} );
	describe( 'sv', () => {
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'sv' );
			expect( counts ).toEqual( '1,2 tn' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'sv' );
			expect( counts ).toEqual( '123 tn' );
		} );
	} );
} );

describe( 'formatNumberMetric', () => {
	test( 'does not abbreviate numbers smaller than 1000', () => {
		expect( formatNumberMetric( 123 ) ).toEqual( '123' );
	} );

	test( 'appends the K unit', () => {
		expect( formatNumberMetric( 123456 ) ).toEqual( '123.5K' );
	} );

	test( 'appends the M unit', () => {
		expect( formatNumberMetric( 123456789 ) ).toEqual( '123.5M' );
	} );

	test( 'appends the G unit', () => {
		expect( formatNumberMetric( 123456789012 ) ).toEqual( '123.5G' );
	} );

	test( 'rounds numbers with metric units to 1 decimal point', () => {
		expect( formatNumberMetric( 4500 ) ).toEqual( '4.5K' );
		expect( formatNumberMetric( 12490 ) ).toEqual( '12.5K' );
		expect( formatNumberMetric( 123546789 ) ).toEqual( '123.5M' );
	} );
} );
