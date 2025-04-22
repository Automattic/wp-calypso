import { setLocaleData, resetLocaleData } from '@wordpress/i18n';
import { addLocaleQueryParam, injectLocalization } from '../';

describe( 'index', () => {
	beforeEach( () => {
		resetLocaleData(); // ensure everything is reset
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
			setLocaleData( { '': { localeSlug: 'fr' } } );
			const params = addLocaleQueryParam( { query: 'search=foo' } );
			expect( params ).toEqual( { query: 'locale=fr&search=foo' } );
		} );

		test( 'should include the locale query parameter for a locale variant', () => {
			setLocaleData( { '': { localeSlug: 'de', localeVariant: 'de_formal' } } );
			const params = addLocaleQueryParam( { query: 'search=foo' } );
			expect( params ).toEqual( { query: 'locale=de_formal&search=foo' } );
		} );

		test( 'should prioritize the locale specified on the request', () => {
			setLocaleData( { '': { localeSlug: 'fr' } } );
			const params = addLocaleQueryParam( { query: 'locale=cs' } );
			expect( params ).toEqual( { query: 'locale=cs' } );
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
			setLocaleData( { '': { localeSlug: 'fr' } } );
			const wpcom = {
				async request( params ) {
					expect( params.query ).toBe( 'locale=fr&search=foo' );
				},
			};

			injectLocalization( wpcom );
			await wpcom.request( { query: 'search=foo' } );
		} );
	} );
} );
