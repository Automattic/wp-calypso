/** @format */
/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	addLocaleToPath,
	getLanguage,
	getLocaleFromPath,
	isDefaultLocale,
	removeLocaleFromPath,
} from 'lib/i18n-utils';

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
	} );
} );
