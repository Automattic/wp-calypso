/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { get, post, put, del } from '../actions';
import { handleRequest } from '../';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_REQUEST_SUCCESS,
	WOOCOMMERCE_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	const siteId = 123;

	describe( '#get', () => {
		const getResponse = { name: 'bogus get response', bogus: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/bogus_endpoint&_method=get', json: true } )
				.reply( 200, { data: getResponse } );
		} );

		it( 'should handle get success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = get( siteId, 'bogus_endpoint' );
			const successAction = {
				type: WOOCOMMERCE_REQUEST_SUCCESS,
				action,
				data: getResponse,
			};

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith( successAction );
			} );
		} );

		it( 'should handle get failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = get( siteId, 'bad_bogus_endpoint' );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;

				const errorSetAction = store.dispatch.getCall( 0 ).args[ 0 ];
				expect( errorSetAction.type ).to.equal( WOOCOMMERCE_ERROR_SET );

				const failureAction = store.dispatch.getCall( 1 ).args[ 0 ];
				expect( failureAction.type ).to.equal( WOOCOMMERCE_REQUEST_FAILURE );
				expect( failureAction.action ).to.equal( action );
				expect( failureAction.error ).to.exist;
			} );

		} );
	} );

	describe( '#post', () => {
		const postResponse = { name: 'bogus post response', bogus: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/bogus_endpoint&_method=post', json: true } )
				.reply( 200, { data: postResponse } );
		} );

		const body = { name: 'post request', bogus: true };

		it( 'should handle post success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = post( siteId, 'bogus_endpoint', body );
			const successAction = {
				type: WOOCOMMERCE_REQUEST_SUCCESS,
				action,
				data: postResponse,
			};

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith( successAction );
			} );
		} );

		it( 'should handle post failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = post( siteId, 'bad_bogus_endpoint', body );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;

				const errorSetAction = store.dispatch.getCall( 0 ).args[ 0 ];
				expect( errorSetAction.type ).to.equal( WOOCOMMERCE_ERROR_SET );

				const failureAction = store.dispatch.getCall( 1 ).args[ 0 ];
				expect( failureAction.type ).to.equal( WOOCOMMERCE_REQUEST_FAILURE );
				expect( failureAction.action ).to.equal( action );
				expect( failureAction.error ).to.exist;
			} );

		} );
	} );

	describe( '#put', () => {
		const putResponse = { name: 'bogus put response', bogus: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/bogus_endpoint&_method=put', json: true } )
				.reply( 200, { data: putResponse } );
		} );

		const body = { name: 'put request', bogus: true };

		it( 'should handle put success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = put( siteId, 'bogus_endpoint', body );
			const successAction = {
				type: WOOCOMMERCE_REQUEST_SUCCESS,
				action,
				data: putResponse,
			};

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith( successAction );
			} );
		} );

		it( 'should handle put failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = put( siteId, 'bad_bogus_endpoint', body );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;

				const errorSetAction = store.dispatch.getCall( 0 ).args[ 0 ];
				expect( errorSetAction.type ).to.equal( WOOCOMMERCE_ERROR_SET );

				const failureAction = store.dispatch.getCall( 1 ).args[ 0 ];
				expect( failureAction.type ).to.equal( WOOCOMMERCE_REQUEST_FAILURE );
				expect( failureAction.action ).to.equal( action );
				expect( failureAction.error ).to.exist;
			} );

		} );
	} );

	describe( '#delete', () => {
		const deleteResponse = { name: 'bogus delete response', bogus: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/bogus_endpoint&_method=delete', json: true } )
				.reply( 200, { data: deleteResponse } );
		} );

		it( 'should handle delete success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = del( siteId, 'bogus_endpoint' );
			const successAction = {
				type: WOOCOMMERCE_REQUEST_SUCCESS,
				action,
				data: deleteResponse,
			};

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith( successAction );
			} );
		} );

		it( 'should handle delete failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = del( siteId, 'bad_bogus_endpoint' );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;

				const errorSetAction = store.dispatch.getCall( 0 ).args[ 0 ];
				expect( errorSetAction.type ).to.equal( WOOCOMMERCE_ERROR_SET );

				const failureAction = store.dispatch.getCall( 1 ).args[ 0 ];
				expect( failureAction.type ).to.equal( WOOCOMMERCE_REQUEST_FAILURE );
				expect( failureAction.action ).to.equal( action );
				expect( failureAction.error ).to.exist;
			} );

		} );
	} );
} );

