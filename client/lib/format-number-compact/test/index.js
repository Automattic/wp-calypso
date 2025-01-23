import i18n from 'i18n-calypso';
import formatNumberCompact, { formatNumberMetric } from 'calypso/lib/format-number-compact';

describe( 'formatNumberCompact', () => {
	beforeEach( function () {
		i18n.configure(); // ensure everything is reset
		i18n.setLocale( {
			'': {
				localeSlug: 'en',
			},
		} );
	} );

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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'es',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeVariant: 'pt-br',
					localeSlug: 'pt',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'de',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'fr',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'he',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'ja',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'it',
				},
			} );
		} );
		test( 'does not support a compact format, use numberFormat directly from i18n', () => {
			const counts = formatNumberCompact( 1234, 'it' );
			expect( counts ).toEqual( null );
		} );
	} );
	describe( 'nl', () => {
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'nl',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'ru',
				},
			} );
		} );
		test( 'the short form is too long to be useful, use numberFormat directly from i18n', () => {
			const counts = formatNumberCompact( 1234, 'ru' );
			expect( counts ).toEqual( null );
		} );
	} );
	describe( 'tr', () => {
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'tr',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'id',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeVariant: 'zh-cn',
					localeSlug: 'zh',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeVariant: 'zh-tw',
					localeSlug: 'zh',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'ko',
				},
			} );
		} );
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
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'ar',
				},
			} );
		} );
		test( 'shows 2 sig figs for counts < 10000', () => {
			const counts = formatNumberCompact( 1234, 'ar' );
			expect( counts ).toEqual( '1.2 ألف' );
		} );
		test( 'shows leading sig figs for counts > 10000', () => {
			const counts = formatNumberCompact( 123456, 'ar' );
			expect( counts ).toEqual( '123 ألف' );
		} );
	} );
	describe( 'sv', () => {
		beforeEach( function () {
			i18n.setLocale( {
				'': {
					localeSlug: 'sv',
				},
			} );
		} );
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
