/** @format */
/**
 * External dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';

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
	getSupportSiteLocale,
	getForumUrl,
	getPathParts,
	filterLanguageRevisions,
} from 'lib/i18n-utils';

jest.mock( 'config', () => key => {
	if ( 'i18n_default_locale_slug' === key ) {
		return 'en';
	}

	if ( 'support_site_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br' ];
	}

	if ( 'forum_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br' ];
	}

	if ( 'languages' === key ) {
		return [
			{ value: 420, langSlug: 'ast', name: 'Asturianu', wpLocale: 'ast', territories: [ '039' ] },
			{
				value: 1,
				langSlug: 'en',
				name: 'English',
				wpLocale: 'en_US',
				popular: 1,
				territories: [ '019' ],
			},
			{
				value: 19,
				langSlug: 'es',
				name: 'Español',
				wpLocale: 'es_ES',
				popular: 2,
				territories: [ '019', '039' ],
			},
			{
				value: 24,
				langSlug: 'fr',
				name: 'Français',
				wpLocale: 'fr_FR',
				popular: 5,
				territories: [ '155' ],
			},
			{
				value: 36,
				langSlug: 'ja',
				name: '日本語',
				wpLocale: 'ja',
				popular: 7,
				territories: [ '030' ],
			},
			{
				value: 438,
				langSlug: 'pt-br',
				name: 'Português do Brasil',
				wpLocale: 'pt_BR',
				popular: 3,
				territories: [ '019' ],
			},
			{
				value: 15,
				langSlug: 'de',
				name: 'Deutsch',
				wpLocale: 'de_DE',
				popular: 4,
				territories: [ '155' ],
			},
			{
				value: 900,
				langSlug: 'de_formal',
				name: 'Deutsch',
				wpLocale: 'de_DE_formal',
				parentLangSlug: 'de',
				popular: 4,
				territories: [ '155' ],
			},
			{ value: 58, langSlug: 'pl', name: 'Polski', wpLocale: 'pl_PL', territories: [ '151' ] },
		];
	}
} );

jest.mock( 'i18n-calypso', () => ( {
	getLocaleSlug: jest.fn( () => 'en' ),
} ) );

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
		test( 'should not change URL for `en`', () => {
			[
				'https://wordpress.com/',
				'https://de.wordpress.com/',
				'https://wordpress.com/start',
			].forEach( fullUrl => {
				getLocaleSlug.mockImplementationOnce( () => 'en' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
			} );
		} );

		test( 'localize trailing slash variations', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
		} );

		test( 'localize logged-out homepage', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://de.wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://br.wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
		} );

		test( 'localize blog url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://br.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
		} );

		test( 'localize support url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://en.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://de.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://br.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://en.support.wordpress.com/'
			);
		} );

		test( 'localize forums url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://en.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://de.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://br.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://en.forums.wordpress.com/'
			);
		} );

		test( 'localize privacy policy', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/privacy/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/de/privacy/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/privacy/'
			);
		} );

		test( 'localize cookie policy', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/cookies/'
			);
		} );
	} );

	describe( '#getSupportSiteLocale', () => {
		test( 'should return `en` by default', () => {
			expect( getSupportSiteLocale() ).toEqual( 'en' );
		} );

		test( 'should return support slug for current i18n locale slug if available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'ja' );
			expect( getSupportSiteLocale() ).toEqual( 'ja' );
		} );

		test( 'should return `en` for current i18n locale slug if not available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'ar' );
			expect( getSupportSiteLocale() ).toEqual( 'en' );
		} );
	} );

	describe( '#getForumUrl', () => {
		test( 'should return `en` forum url by default', () => {
			expect( getForumUrl() ).toEqual( '//en.forums.wordpress.com' );
		} );

		test( 'should return forum url for current i18n locale slug if available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( getForumUrl() ).toEqual( '//de.forums.wordpress.com' );
		} );

		test( 'should return `en` for current i18n locale slug if not available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'xxxx' );
			expect( getForumUrl() ).toEqual( '//en.forums.wordpress.com' );
		} );

		test( 'should prioritize passed argument over current local', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( getForumUrl( 'ja' ) ).toEqual( '//ja.forums.wordpress.com' );
		} );

		test( 'should return `en` if passed argument is not available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( getForumUrl( 'boom!' ) ).toEqual( '//en.forums.wordpress.com' );
		} );

		test( 'should return `en` for if neither current i18n locale slug nor passed argument is available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'bonnie' );
			expect( getForumUrl( 'clyde' ) ).toEqual( '//en.forums.wordpress.com' );
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
} );
