/**
 * External dependencies
 */
import { expect } from 'chai';
import rewire from 'rewire';
import mockery from 'mockery';
import sinon from 'sinon';

describe( 'localization', () => {
	let localization, addLocaleQueryParam, injectLocalization, bindState;
	let getCurrentUserLocaleMock = sinon.stub();

	before( () => {
		// Mock user locale state selector
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'state/current-user/selectors', {
			getCurrentUserLocale: () => getCurrentUserLocaleMock()
		} );

		// Prepare module for rewiring
		localization = rewire( '../' );
		addLocaleQueryParam = localization.addLocaleQueryParam;
		injectLocalization = localization.injectLocalization;
		bindState = localization.bindState;
	} );

	beforeEach( () => {
		localization.__set__( 'locale', undefined );
	} );

	after( function() {
		mockery.disable();
	} );

	describe( '#addLocaleQueryParam()', () => {
		it( 'should not modify params if locale unknown', () => {
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		it( 'should not modify params if locale is default', () => {
			localization.__set__( 'locale', 'en' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( { query: 'search=foo' } );
		} );

		it( 'should include the locale query parameter for a non-default locale', () => {
			localization.__set__( 'locale', 'fr' );
			const params = addLocaleQueryParam( { query: 'search=foo' } );

			expect( params ).to.eql( {
				query: 'search=foo&locale=fr'
			} );
		} );
	} );

	describe( '#injectLocalization()', () => {
		it( 'should return a modified object', () => {
			let wpcom = { request() {} };
			injectLocalization( wpcom );

			expect( wpcom.withLocale ).to.be.a( 'function' );
		} );

		it( 'should override the default request method', () => {
			const request = () => {};
			let wpcom = { request };
			injectLocalization( wpcom );

			expect( wpcom.request ).to.not.equal( request );
		} );

		it( 'should not modify params if `withLocale` not used', ( done ) => {
			localization.__set__( 'locale', 'fr' );
			let wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=foo' );
					done();
				}
			};

			injectLocalization( wpcom );
			wpcom.request( { query: 'search=foo' } );
		} );

		it( 'should modify params if `withLocale` is used', ( done ) => {
			localization.__set__( 'locale', 'fr' );
			let wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=foo&locale=fr' );
					done();
				}
			};

			injectLocalization( wpcom );
			wpcom.withLocale().request( { query: 'search=foo' } );
		} );

		it( 'should not modify the request after `withLocale` is used', ( done ) => {
			localization.__set__( 'locale', 'fr' );
			let assert = false;
			let wpcom = {
				request( params ) {
					if ( ! assert ) {
						return;
					}

					expect( params.query ).to.equal( 'search=foo' );
					done();
				}
			};

			injectLocalization( wpcom );
			wpcom.withLocale().request( { query: 'search=foo' } );
			assert = true;
			wpcom.request( { query: 'search=foo' } );
		} );
	} );

	describe( '#bindState()', () => {
		it( 'should set initial locale from state', () => {
			getCurrentUserLocaleMock = sinon.stub().returns( 'fr' );
			bindState( { subscribe() {}, getState() {} } );
			expect( localization.__get__( 'locale' ) ).to.equal( 'fr' );
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

			expect( localization.__get__( 'locale' ) ).to.equal( 'de' );
		} );
	} );
} );
