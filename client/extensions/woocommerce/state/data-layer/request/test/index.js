/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { get, post, put, del } from '../actions';
import { handleRequest } from '../';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_API_REQUEST_SUCCESS,
	WOOCOMMERCE_API_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	const siteId = 123;

	describe( '#get', () => {
		const getResponse = { name: 'placeholder get response', placeholder: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_method=get', json: true } )
				.reply( 200, { data: getResponse } );
		} );

		it( 'should handle get success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = get( siteId, 'placeholder_endpoint' );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: getResponse } )
				);
			} );
		} );

		it( 'should handle get failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = get( siteId, 'bad_placeholder_endpoint' );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith( match( { type: WOOCOMMERCE_ERROR_SET } ) );
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } )
						.and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#post', () => {
		const postResponse = { name: 'placeholder post response', placeholder: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_method=post', json: true } )
				.reply( 200, { data: postResponse } );
		} );

		const body = { name: 'post request', placeholder: true };

		it( 'should handle post success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = post( siteId, 'placeholder_endpoint', body );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: postResponse } )
				);
			} );
		} );

		it( 'should handle post failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = post( siteId, 'bad_placeholder_endpoint', body );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith( match( { type: WOOCOMMERCE_ERROR_SET } ) );
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } )
						.and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#put', () => {
		const putResponse = { name: 'placeholder put response', placeholder: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_method=put', json: true } )
				.reply( 200, { data: putResponse } );
		} );

		const body = { name: 'put request', placeholder: true };

		it( 'should handle put success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = put( siteId, 'placeholder_endpoint', body );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: putResponse } )
				);
			} );
		} );

		it( 'should handle put failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = put( siteId, 'bad_placeholder_endpoint', body );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith( match( { type: WOOCOMMERCE_ERROR_SET } ) );
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } )
						.and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#delete', () => {
		const deleteResponse = { name: 'placeholder delete response', placeholder: true };

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_method=delete', json: true } )
				.reply( 200, { data: deleteResponse } );
		} );

		it( 'should handle delete success', () => {
			const store = {
				dispatch: spy(),
			};

			const action = del( siteId, 'placeholder_endpoint' );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledOnce;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: deleteResponse } )
				);
			} );
		} );

		it( 'should handle delete failure', () => {
			const store = {
				dispatch: spy(),
			};

			const action = del( siteId, 'bad_placeholder_endpoint' );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith( match( { type: WOOCOMMERCE_ERROR_SET } ) );
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } )
						.and( match.has( 'error' ) )
				);
			} );
		} );
	} );
} );

