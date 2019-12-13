/**
 * Internal dependencies
 */
import { addLocaleQueryParam, bindState, getLocale, injectLocalization, setLocale } from '../';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'state/selectors/get-current-locale-variant';

jest.mock( 'state/selectors/get-current-locale-slug' );
jest.mock( 'state/selectors/get-current-locale-variant' );

describe( 'index', () => {
	beforeEach( () => {
		setLocale( undefined );
	} );

	describe( '#addLocaleQueryParam()', () => {
		test( 'should not modify params if locale unknown', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).toEqual( { query: 'search=foo' } );
		} );

		test( 'should not modify params if locale is default', () => {
			setLocale( 'en' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).toEqual( { query: 'search=foo' } );
		} );

		test( 'should include the locale query parameter for a non-default locale', () => {
			setLocale( 'fr' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).toEqual( { query: 'search=foo&locale=fr' } );
		} );

		test( 'should prefer and set initial variant locale from state', () => {
			getCurrentLocaleVariant.mockReturnValueOnce( 'fr_formal' );
			bindState( { subscribe() {}, getState() {} } );
			expect( getLocale() ).toBe( 'fr_formal' );
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
			setLocale( 'fr' );
			const wpcom = {
				async request( params ) {
					expect( params.query ).toBe( 'search=foo&locale=fr' );
				},
			};

			injectLocalization( wpcom );
			await wpcom.request( { query: 'search=foo' } );
		} );
	} );

	describe( '#bindState()', () => {
		test( 'should set initial locale from state', () => {
			getCurrentLocaleSlug.mockReturnValueOnce( 'fr' );
			bindState( { subscribe() {}, getState() {} } );
			expect( getLocale() ).toBe( 'fr' );
		} );

		test( 'should subscribe to the store, setting locale on change', () => {
			let listener;
			bindState( {
				subscribe( _listener ) {
					listener = _listener;
				},
				getState() {},
			} );
			getCurrentLocaleSlug.mockReturnValueOnce( 'de' );
			listener();

			expect( getLocale() ).toBe( 'de' );
		} );
	} );
} );
