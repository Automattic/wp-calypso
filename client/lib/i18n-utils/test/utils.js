/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:i18n-utils:test' ); // eslint-disable-line no-unused-vars
import assert from 'assert';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { removeLocaleFromPath, addLocaleToPath, getLanguage, getLocaleFromPath } from 'lib/i18n-utils';

describe( 'utils', function() {
	describe( '#addLocaleToPath', function() {
		it( 'adds a locale to the path', function() {
			assert.equal( addLocaleToPath( '/start/flow/step', 'fr' ), '/start/flow/step/fr' );
		} );

		it( 'adds a locale to the path, replacing any previous locale', function() {
			assert.equal( addLocaleToPath( '/start/flow/step/de', 'fr' ), '/start/flow/step/fr' );
		} );

		it( 'adds a locale to the path, keeping query string intact', function() {
			assert.equal( addLocaleToPath( '/start/flow/step?foo=bar', 'fr' ), '/start/flow/step/fr?foo=bar' );
		} );
	} );

	describe( '#removeLocaleFromPath', function() {
		it( 'should remove the :lang part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start/fr' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow/fr' ), '/start/flow' );
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );

		it( 'should remove the :lang part of the URL, keeping any query string', function() {
			assert.equal( removeLocaleFromPath( '/start/flow/step/fr?foo=bar' ), '/start/flow/step?foo=bar' );
		} );

		it( 'should not change the URL if no lang is present', function() {
			assert.equal( removeLocaleFromPath( '/start/flow/step?foo=bar' ), '/start/flow/step?foo=bar' );
		} );

		it( 'should not remove the :flow part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow' ), '/start/flow' );
		} );

		it( 'should not remove the :step part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );

		it( 'should not remove keys from an invite', function() {
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

	describe( '#getLocaleFromPath', function() {
		it( 'should return undefined when no locale at end of path', function() {
			assert.equal( getLocaleFromPath( '/start' ), undefined );
		} );

		it( 'should return locale string when at end of path', function() {
			assert.equal( getLocaleFromPath( '/start/es' ), 'es' );
			assert.equal( getLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' ), 'es' );
		} );
	} );

	describe( '#getLanguage', function() {
		it( 'should return a language', function() {
			expect( getLanguage( 'ja' ).langSlug ).to.equal( 'ja' );
		} );

		it( 'should return a language with a country code', function() {
			expect( getLanguage( 'pt-br' ).langSlug ).to.equal( 'pt-br' );
		} );

		it( 'should fall back to the language code when a country code is not available', function() {
			expect( getLanguage( 'fr-zz' ).langSlug ).to.equal( 'fr' );
		} );

		it( 'should return undefined when no arguments are given', function() {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage() ).to.equal( undefined );
		} );

		it( 'should return undefined when the locale is invalid', function() {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage( 'zz' ) ).to.equal( undefined );
		} );

		it( 'should return undefined when we lookup random words', function() {
			expect( getLanguage( 'themes' ) ).to.equal( undefined );
		} );

		it( 'should return a language with a three letter country code', function() {
			expect( getLanguage( 'ast' ).langSlug ).to.equal( 'ast' );
		} );
	} );
} );
