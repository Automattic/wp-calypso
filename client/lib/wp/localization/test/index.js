/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { addLocaleQueryParam, bindState, getLocale, injectLocalization, setLocale } from '../';
import {
	getCurrentUserLocale as getCurrentUserLocaleMock,
	getCurrentUserLocaleVariant as getCurrentUserLocaleVariantMock,
} from 'state/current-user/selectors';

jest.mock( 'state/current-user/selectors', () => ( {
	getCurrentUserLocale: jest.fn(),
	getCurrentUserLocaleVariant: jest.fn(),
} ) );

describe( 'index', () => {
	beforeEach( () => {
		setLocale( undefined );
	} );

	describe( '#addLocaleQueryParam()', () => {
		test( 'should not modify params if locale unknown', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		test( 'should not modify params if locale is default', () => {
			setLocale( 'en' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		test( 'should include the locale query parameter for a non-default locale', () => {
			setLocale( 'fr' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( {
				query: 'search=foo&locale=fr',
			} );
		} );

		test( 'should prefer and set initial variant locale from state', () => {
			getCurrentUserLocaleVariantMock.mockReturnValueOnce( 'fr_formal' );
			bindState( { subscribe() {}, getState() {} } );
			expect( getLocale() ).to.equal( 'fr_formal' );
		} );
	} );

	describe( '#injectLocalization()', () => {
		test( 'should return a modified object', () => {
			const wpcom = { request() {} };
			injectLocalization( wpcom );

			expect( wpcom.localized ).to.exist;
		} );

		test( 'should override the default request method', () => {
			const request = () => {};
			const wpcom = { request };
			injectLocalization( wpcom );

			expect( wpcom.request ).to.not.equal( request );
		} );

		test( 'should modify params by default', done => {
			setLocale( 'fr' );
			const wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=foo&locale=fr' );
					done();
				},
			};

			injectLocalization( wpcom );
			wpcom.request( { query: 'search=foo' } );
		} );
	} );

	describe( '#bindState()', () => {
		test( 'should set initial locale from state', () => {
			getCurrentUserLocaleMock.mockReturnValueOnce( 'fr' );
			bindState( { subscribe() {}, getState() {} } );
			expect( getLocale() ).to.equal( 'fr' );
		} );

		test( 'should subscribe to the store, setting locale on change', () => {
			let listener;
			bindState( {
				subscribe( _listener ) {
					listener = _listener;
				},
				getState() {},
			} );
			getCurrentUserLocaleMock.mockReturnValueOnce( 'de' );
			listener();

			expect( getLocale() ).to.equal( 'de' );
		} );
	} );
} );
