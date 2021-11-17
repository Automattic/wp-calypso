/**
 * @jest-environment jsdom
 */

import languages, { getLanguage } from '../src';

describe( 'languages', () => {
	test( 'languages contains locale data', () => {
		expect( languages ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					calypsoPercentTranslated: 100,
					isTranslatedIncompletely: false,
					langSlug: 'en',
					name: 'English',
					parentLangSlug: null,
					popular: 1,
					revision: null,
					territories: [ '019' ],
					value: 1,
					wpLocale: 'en_US',
				} ),
			] )
		);
	} );

	test( 'contains non english languages', () => {
		expect( languages ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					langSlug: 'es-mx',
					name: 'Español de México',
					parentLangSlug: 'es',
					wpLocale: 'es_MX',
				} ),
			] )
		);
	} );
} );

describe( 'getLanguage', () => {
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
