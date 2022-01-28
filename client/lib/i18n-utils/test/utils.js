import {
	isDefaultLocale,
	localizeUrl,
	canBeTranslated,
	translationExists,
	isMagnificentLocale,
} from 'calypso/lib/i18n-utils';
import {
	addLocaleToPath,
	getLocaleFromPath,
	removeLocaleFromPath,
} from 'calypso/lib/i18n-utils/path';

jest.mock( '@automattic/calypso-config', () => ( key ) => {
	if ( 'i18n_default_locale_slug' === key ) {
		return 'en';
	}

	if ( 'support_site_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br' ];
	}

	if ( 'forum_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br', 'th' ];
	}

	if ( 'magnificent_non_en_locales' === key ) {
		return [
			'es',
			'pt-br',
			'de',
			'fr',
			'he',
			'ja',
			'it',
			'nl',
			'ru',
			'tr',
			'id',
			'zh-cn',
			'zh-tw',
			'ko',
			'ar',
			'sv',
		];
	}

	if ( 'jetpack_com_locales' === key ) {
		return [
			'en',
			'ar',
			'de',
			'es',
			'fr',
			'he',
			'id',
			'it',
			'ja',
			'ko',
			'nl',
			'pt-br',
			'ro',
			'ru',
			'sv',
			'tr',
			'zh-cn',
			'zh-tw',
		];
	}
} );

// Mock only the getLocaleSlug function from i18n-calypso, and use
// original references for all the other functions
function mockFunctions() {
	const original = jest.requireActual( 'i18n-calypso' ).default;
	return Object.assign( Object.create( Object.getPrototypeOf( original ) ), original, {
		getLocaleSlug: jest.fn( () => 'en' ),
	} );
}
jest.mock( 'i18n-calypso', () => mockFunctions() );
const { getLocaleSlug } = jest.requireMock( 'i18n-calypso' );

describe( 'utils', () => {
	describe( '#isDefaultLocale', () => {
		test( 'should return false when a non-default locale provided', () => {
			expect( isDefaultLocale( 'fr' ) ).toEqual( false );
		} );

		test( 'should return true when a default locale provided', () => {
			expect( isDefaultLocale( 'en' ) ).toEqual( true );
		} );
	} );

	describe( '#addLocaleToPath', () => {
		test( 'adds a locale to the path', () => {
			expect( addLocaleToPath( '/start/flow/step', 'fr' ) ).toEqual( '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, replacing any previous locale', () => {
			expect( addLocaleToPath( '/start/flow/step/de', 'fr' ) ).toEqual( '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, keeping query string intact', () => {
			expect( addLocaleToPath( '/start/flow/step?foo=bar', 'fr' ) ).toEqual(
				'/start/flow/step/fr?foo=bar'
			);
		} );
	} );

	describe( '#removeLocaleFromPath', () => {
		test( 'should remove the :lang part of the URL', () => {
			expect( removeLocaleFromPath( '/start/fr' ) ).toEqual( '/start' );
			expect( removeLocaleFromPath( '/start/flow/fr' ) ).toEqual( '/start/flow' );
			expect( removeLocaleFromPath( '/start/flow/step' ) ).toEqual( '/start/flow/step' );
		} );

		test( 'should remove the :lang part of the URL, keeping any query string', () => {
			expect( removeLocaleFromPath( '/log-in/pl?foo=bar' ) ).toEqual( '/log-in?foo=bar' );
			expect( removeLocaleFromPath( '/start/flow/step/fr?foo=bar' ) ).toEqual(
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not change the URL if no lang is present', () => {
			expect( removeLocaleFromPath( '/log-in' ) ).toEqual( '/log-in' );
			expect( removeLocaleFromPath( '/start/flow/step?foo=bar' ) ).toEqual(
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not remove the :flow part of the URL', () => {
			expect( removeLocaleFromPath( '/start' ) ).toEqual( '/start' );
			expect( removeLocaleFromPath( '/start/flow' ) ).toEqual( '/start/flow' );
		} );

		test( 'should not remove the :step part of the URL', () => {
			expect( removeLocaleFromPath( '/start/flow/step' ) ).toEqual( '/start/flow/step' );
		} );

		test( 'should not remove keys from an invite', () => {
			expect( removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/es' ) ).toEqual(
				'/accept-invite/site.wordpress.com/123456'
			);
			expect(
				removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' )
			).toEqual( '/accept-invite/site.wordpress.com/123456/123456/123456' );
		} );
	} );

	describe( '#getLocaleFromPath', () => {
		test( 'should return undefined when no locale at end of path', () => {
			expect( getLocaleFromPath( '/start' ) ).toBeUndefined();
		} );

		test( 'should return locale string when at end of path', () => {
			expect( getLocaleFromPath( '/start/es' ) ).toEqual( 'es' );
			expect(
				getLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' )
			).toEqual( 'es' );
		} );

		test( 'should correctly handle paths with query string', () => {
			expect( getLocaleFromPath( '/start/es?query=string' ) ).toEqual( 'es' );
		} );
	} );

	describe( '#canBeTranslated', () => {
		test( 'should return true by default', () => {
			expect( canBeTranslated() ).toEqual( true );
		} );

		test( 'should return false for elements in the exception list', () => {
			expect( canBeTranslated( 'en' ) ).toEqual( false );
			expect( canBeTranslated( 'sr_latin' ) ).toEqual( false );
		} );

		test( 'should return true for languages not in the exception list', () => {
			expect( canBeTranslated( 'de' ) ).toEqual( true );
		} );
	} );

	describe( '#localizeUrl', () => {
		test( 'localizeUrl is still provided by client/lib/i18n-utils', () => {
			expect( localizeUrl( 'https://wordpress.com/', 'de' ) ).toEqual(
				'https://wordpress.com/de/'
			);
		} );

		test( 'client/lib/i18n-utils/localizeUrl still uses getLocaleSlug', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://wordpress.com/support/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://wordpress.com/de/support/'
			);
		} );
	} );

	describe( 'translationExists()', function () {
		it( 'should return true for a simple translation', function () {
			expect( translationExists( 'test1' ) ).toBe( true );
		} );

		it( 'should return false for a string without translation', function () {
			getLocaleSlug.mockImplementationOnce( () => 'fr' );
			expect(
				translationExists(
					'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness…'
				)
			).toBe( false );
		} );

		it( 'should return true for a simple translation when using default locale', function () {
			expect( translationExists( 'test1' ) ).toBe( true );
		} );

		it( 'should return true for a string without translation when using default locale', function () {
			expect(
				translationExists(
					'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness…'
				)
			).toBe( true );
		} );
	} );

	describe( 'isMagnificentLocale()', function () {
		it( 'should return true for magnificent locales', function () {
			[
				'es',
				'pt-br',
				'de',
				'fr',
				'he',
				'ja',
				'it',
				'nl',
				'ru',
				'tr',
				'id',
				'zh-cn',
				'zh-tw',
				'ko',
				'ar',
				'sv',
			].forEach( ( locale ) => {
				expect( isMagnificentLocale( locale ) ).toBe( true );
			} );
		} );

		it( 'should return false for non-magnificent locales', function () {
			expect( isMagnificentLocale( 'bg' ) ).toBe( false );
			expect( isMagnificentLocale( 'ro' ) ).toBe( false );
		} );

		it( 'should return false for english locale', function () {
			expect( isMagnificentLocale( 'en' ) ).toBe( false );
		} );
	} );
} );
