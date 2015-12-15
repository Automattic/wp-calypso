/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:i18n-utils:test' ); // eslint-disable-line no-unused-vars
import assert from 'assert';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { removeLocaleFromPath, getLanguage } from 'lib/i18n-utils';

describe( 'i18n-utils', function() {
	describe( 'removeLocaleFromPath', function() {
		it( 'should remove the :lang part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start/fr' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow/fr' ), '/start/flow' );
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );

		it( 'should not remove the :flow part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start' ), '/start' );
			assert.equal( removeLocaleFromPath( '/start/flow' ), '/start/flow' );
		} );

		it( 'should not remove the :step part of the URL', function() {
			assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
		} );
	} );
	describe( 'getLanguage', function() {
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
	} );
} );
