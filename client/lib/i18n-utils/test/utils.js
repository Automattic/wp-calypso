/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	addLocaleToPath,
	getLanguage,
	getLocaleFromPath,
	isDefaultLocale,
	removeLocaleFromPath,
	isLocaleVariant,
	localizeUrl,
	canBeTranslated,
	getPathParts,
	filterLanguageRevisions,
	translationExists,
	isMagnificentLocale,
} from 'calypso/lib/i18n-utils';

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

	describe( '#getLanguage', () => {
		test( 'should return a language', () => {
			expect( getLanguage( 'ja' ).langSlug ).toEqual( 'ja' );
		} );

		test( 'should return a language with a country code', () => {
			expect( getLanguage( 'pt-br' ).langSlug ).toEqual( 'pt-br' );
		} );

		test( 'should fall back to the language code when a country code is not available', () => {
			expect( getLanguage( 'fr-zz' ).langSlug ).toEqual( 'fr' );
		} );

		test( 'should return undefined when no arguments are given', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage() ).toBeUndefined();
		} );

		test( 'should return undefined when the locale is invalid', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage( 'zz' ) ).toBeUndefined();
		} );

		test( 'should return undefined when we lookup random words', () => {
			expect( getLanguage( 'themes' ) ).toBeUndefined();
			expect( getLanguage( 'log-in' ) ).toBeUndefined();
		} );

		test( 'should return a language with a three letter country code', () => {
			expect( getLanguage( 'ast' ).langSlug ).toEqual( 'ast' );
		} );

		test( 'should return the variant', () => {
			expect( getLanguage( 'de_formal' ).langSlug ).toEqual( 'de_formal' );
		} );

		test( 'should return the parent slug since the given variant does not exist', () => {
			expect( getLanguage( 'fr_formal' ).langSlug ).toEqual( 'fr' );
		} );
	} );

	describe( '#isLocaleVariant', () => {
		test( 'should return false by default', () => {
			expect( isLocaleVariant( 'lol' ) ).toEqual( false );
			expect( isLocaleVariant() ).toEqual( false );
		} );

		test( 'should detect a locale variant', () => {
			expect( isLocaleVariant( 'de_formal' ) ).toEqual( true );
		} );

		test( 'should detect a root language', () => {
			expect( isLocaleVariant( 'de' ) ).toEqual( false );
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
				'https://de.wordpress.com/'
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

	describe( '#getPathParts', () => {
		test( 'should split path', () => {
			expect( getPathParts( '/show/me/the/money' ) ).toEqual( [
				'',
				'show',
				'me',
				'the',
				'money',
			] );
		} );
		test( 'should split path and remove trailing slash', () => {
			expect( getPathParts( '/show/me/the/money/' ) ).toEqual( [
				'',
				'show',
				'me',
				'the',
				'money',
			] );
		} );
	} );
	describe( 'filterLanguageRevisions()', () => {
		const valid = {
			en: 123,
			ja: 456,
		};

		test( 'should leave a valid object as it is', () => {
			expect( filterLanguageRevisions( valid ) ).toEqual( valid );
		} );

		test( 'should filter out unexpected keys.', () => {
			const invalid = {
				hahahaha: 999,
				...valid,
			};

			expect( filterLanguageRevisions( invalid ) ).toEqual( valid );
		} );

		test( 'should filter out unexpected values.', () => {
			const invalid = {
				es: 'to crash or not to crash, that is the problem.',
				...valid,
			};

			expect( filterLanguageRevisions( invalid ) ).toEqual( valid );
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
