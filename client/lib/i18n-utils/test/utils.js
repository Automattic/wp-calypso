/** @format */
/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { expect } from 'chai';
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
	canBeTranslated,
	getSupportSiteLocale,
	getForumUrl,
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
			expect( isDefaultLocale( 'fr' ) ).to.be.false;
		} );

		test( 'should return true when a default locale provided', () => {
			expect( isDefaultLocale( 'en' ) ).to.be.true;
		} );
	} );

	describe( '#addLocaleToPath', () => {
		test( 'adds a locale to the path', () => {
			assert.equal( addLocaleToPath( '/start/flow/step', 'fr' ), '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, replacing any previous locale', () => {
			assert.equal( addLocaleToPath( '/start/flow/step/de', 'fr' ), '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, keeping query string intact', () => {
			assert.equal(
				addLocaleToPath( '/start/flow/step?foo=bar', 'fr' ),
				'/start/flow/step/fr?foo=bar'
			);
		} );
	} );

	describe( '#removeLocaleFromPath', () => {
		test( 'should remove the :lang part of the URL', () => {
			assert.equal( removeLocaleFromPath( '/start/fr' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow/fr' ), '/start/flow' );
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );

		test( 'should remove the :lang part of the URL, keeping any query string', () => {
			assert.equal( removeLocaleFromPath( '/log-in/pl?foo=bar' ), '/log-in?foo=bar' );
			assert.equal(
				removeLocaleFromPath( '/start/flow/step/fr?foo=bar' ),
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not change the URL if no lang is present', () => {
			assert.equal( removeLocaleFromPath( '/log-in' ), '/log-in' );
			assert.equal(
				removeLocaleFromPath( '/start/flow/step?foo=bar' ),
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not remove the :flow part of the URL', () => {
			assert.equal( removeLocaleFromPath( '/start' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow' ), '/start/flow' );
		} );

		test( 'should not remove the :step part of the URL', () => {
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );

		test( 'should not remove keys from an invite', () => {
			assert.equal(
				removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/es' ),
				'/accept-invite/site.wordpress.com/123456'
			);
			assert.equal(
				removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' ),
				'/accept-invite/site.wordpress.com/123456/123456/123456'
			);
		} );
	} );

	describe( '#getLocaleFromPath', () => {
		test( 'should return undefined when no locale at end of path', () => {
			assert.equal( getLocaleFromPath( '/start' ), undefined );
		} );

		test( 'should return locale string when at end of path', () => {
			assert.equal( getLocaleFromPath( '/start/es' ), 'es' );
			assert.equal(
				getLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' ),
				'es'
			);
		} );

		test( 'should correctly handle paths with query string', () => {
			assert.equal( getLocaleFromPath( '/start/es?query=string' ), 'es' );
		} );
	} );

	describe( '#getLanguage', () => {
		test( 'should return a language', () => {
			expect( getLanguage( 'ja' ).langSlug ).to.equal( 'ja' );
		} );

		test( 'should return a language with a country code', () => {
			expect( getLanguage( 'pt-br' ).langSlug ).to.equal( 'pt-br' );
		} );

		test( 'should fall back to the language code when a country code is not available', () => {
			expect( getLanguage( 'fr-zz' ).langSlug ).to.equal( 'fr' );
		} );

		test( 'should return undefined when no arguments are given', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage() ).to.equal( undefined );
		} );

		test( 'should return undefined when the locale is invalid', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage( 'zz' ) ).to.equal( undefined );
		} );

		test( 'should return undefined when we lookup random words', () => {
			expect( getLanguage( 'themes' ) ).to.equal( undefined );
			expect( getLanguage( 'log-in' ) ).to.equal( undefined );
		} );

		test( 'should return a language with a three letter country code', () => {
			expect( getLanguage( 'ast' ).langSlug ).to.equal( 'ast' );
		} );

		test( 'should return the variant', () => {
			expect( getLanguage( 'de', 'de_formal' ).langSlug ).to.equal( 'de_formal' );
		} );

		test( 'should return the parent slug since the given variant does not exist', () => {
			expect( getLanguage( 'fr', 'fr_formal' ).langSlug ).to.equal( 'fr' );
		} );
	} );

	describe( '#isLocaleVariant', () => {
		test( 'should return false by default', () => {
			expect( isLocaleVariant( 'lol' ) ).to.be.false;
			expect( isLocaleVariant() ).to.be.false;
		} );

		test( 'should detect a locale variant', () => {
			expect( isLocaleVariant( 'de_formal' ) ).to.be.true;
		} );

		test( 'should detect a root language', () => {
			expect( isLocaleVariant( 'de' ) ).to.be.false;
		} );
	} );

	describe( '#canBeTranslated', () => {
		test( 'should return true by default', () => {
			expect( canBeTranslated() ).to.be.true;
		} );

		test( 'should return false for elements in the exception list', () => {
			expect( canBeTranslated( 'en' ) ).to.be.false;
			expect( canBeTranslated( 'sr_latin' ) ).to.be.false;
		} );

		test( 'should return true for languages not in the exception list', () => {
			expect( canBeTranslated( 'de' ) ).to.be.true;
		} );
	} );

	describe( '#getSupportSiteLocale', () => {
		test( 'should return `en` by default', () => {
			expect( getSupportSiteLocale() ).to.equal( 'en' );
		} );

		test( 'should return support slug for current i18n locale slug if available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'ja' );
			expect( getSupportSiteLocale() ).to.equal( 'ja' );
		} );

		test( 'should return `en` for current i18n locale slug if not available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'ar' );
			expect( getSupportSiteLocale() ).to.equal( 'en' );
		} );
	} );

	describe( '#getForumUrl', () => {
		test( 'should return `en` forum url by default', () => {
			expect( getForumUrl() ).to.equal( '//en.forums.wordpress.com' );
		} );

		test( 'should return forum url for current i18n locale slug if available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( getForumUrl() ).to.equal( '//de.forums.wordpress.com' );
		} );

		test( 'should return `en` for current i18n locale slug if not available in config', () => {
			getLocaleSlug.mockImplementationOnce( () => 'xxxx' );
			expect( getForumUrl() ).to.equal( '//en.forums.wordpress.com' );
		} );
	} );
} );
