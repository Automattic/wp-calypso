/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'index', () => {
	let getCurrentUserLocaleMock, addLocaleQueryParam,
		injectLocalization, bindState, setLocale, getLocale;

	useMockery();

	before( () => {
		// Mock user locale state selector
		mockery.registerMock( 'state/current-user/selectors', {
			getCurrentUserLocale: () => getCurrentUserLocaleMock()
		} );

		// Prepare module for rewiring
		( {
			addLocaleQueryParam,
			injectLocalization,
			bindState,
			setLocale,
			getLocale
		} = require( '../' ) );
	} );

	beforeEach( () => {
		setLocale( undefined );
	} );

	describe( '#addLocaleQueryParam()', () => {
		it( 'should not modify params if locale unknown', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		it( 'should not modify params if locale is default', () => {
			setLocale( 'en' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		it( 'should include the locale query parameter for a non-default locale', () => {
			setLocale( 'fr' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( {
				query: 'search=foo&locale=fr'
			} );
		} );
	} );

	describe( '#injectLocalization()', () => {
		it( 'should return a modified object', () => {
			const wpcom = { request() {} };
			injectLocalization( wpcom );

			expect( wpcom.localized ).to.exist;
		} );

		it( 'should override the default request method', () => {
			const request = () => {};
			const wpcom = { request };
			injectLocalization( wpcom );

			expect( wpcom.request ).to.not.equal( request );
		} );

		it( 'should modify params by default', ( done ) => {
			setLocale( 'fr' );
			const wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=foo&locale=fr' );
					done();
				}
			};

			injectLocalization( wpcom );
			wpcom.request( { query: 'search=foo' } );
		} );
	} );

	describe( '#bindState()', () => {
		it( 'should set initial locale from state', () => {
			getCurrentUserLocaleMock = sinon.stub().returns( 'fr' );
			bindState( { subscribe() {}, getState() {} } );
			expect( getLocale() ).to.equal( 'fr' );
		} );

		it( 'should subscribe to the store, setting locale on change', () => {
			let listener;
			bindState( {
				subscribe( _listener ) {
					listener = _listener;
				},
				getState() {}
			} );
			getCurrentUserLocaleMock = sinon.stub().returns( 'de' );
			listener();

			expect( getLocale() ).to.equal( 'de' );
		} );
	} );
} );
