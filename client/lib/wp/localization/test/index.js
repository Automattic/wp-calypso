/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleQueryParam, injectLocalization } from '../';

describe( 'index', () => {
	beforeEach( () => {
		i18n.configure(); // ensure everything is reset
	} );

	describe( '#addLocaleQueryParam()', () => {
		test( 'should not modify params if locale unknown', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).toEqual( { query: 'search=foo' } );
		} );

		test( 'should not modify params if locale is default', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );
			expect( params ).toEqual( { query: 'search=foo' } );
		} );

		test( 'should include the locale query parameter for a non-default locale', () => {
			i18n.setLocale( { '': { localeSlug: 'fr' } } );
			const params = addLocaleQueryParam( { query: 'search=foo' } );
			expect( params ).toEqual( { query: 'search=foo&locale=fr' } );
		} );

		test( 'should include the locale query parameter for a locale variant', () => {
			i18n.setLocale( { '': { localeSlug: 'de', localeVariant: 'de_formal' } } );
			const params = addLocaleQueryParam( { query: 'search=foo' } );
			expect( params ).toEqual( { query: 'search=foo&locale=de_formal' } );
		} );
	} );

	describe( '#injectLocalization()', () => {
		test( 'should return a modified object', () => {
			const wpcom = { request() {} };
			injectLocalization( wpcom );
			expect( wpcom ).toHaveProperty( 'localized' );
		} );

		test( 'should override the default request method', () => {
			const request = () => {};
			const wpcom = { request };
			injectLocalization( wpcom );
			expect( wpcom.request ).not.toBe( request );
		} );

		test( 'should modify params by default', async () => {
			i18n.setLocale( { '': { localeSlug: 'fr' } } );
			const wpcom = {
				async request( params ) {
					expect( params.query ).toBe( 'search=foo&locale=fr' );
				},
			};

			injectLocalization( wpcom );
			await wpcom.request( { query: 'search=foo' } );
		} );
	} );
} );
