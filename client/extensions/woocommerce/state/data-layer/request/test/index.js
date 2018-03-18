/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { handleRequest } from '../';
import { get, post, put, del } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_API_REQUEST_SUCCESS,
	WOOCOMMERCE_API_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	const siteId = 123;

	describe( '#get', () => {
		const getResponse = { name: 'placeholder get response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=get', json: true } )
				.reply( 200, { data: getResponse } );
		} );

		test( 'should handle get success', () => {
			const store = {
				dispatch: spy(),
			};

			const onSuccessAction = {
				type: '%%ON_SUCCESS_ACTION%%',
			};

			const action = get( siteId, 'placeholder_endpoint', onSuccessAction );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: getResponse } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onSuccessAction.type } ).and( match.has( 'data' ) )
				);
			} );
		} );

		test( 'should handle get failure', () => {
			const store = {
				dispatch: spy(),
			};

			const onFailureAction = {
				type: '%%ON_FAILURE_ACTION%%',
			};

			const action = get( siteId, 'bad_placeholder_endpoint', null, onFailureAction );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledThrice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_ERROR_SET } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } ).and(
						match.has( 'error' )
					)
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onFailureAction.type } ).and( match.has( 'error' ) )
				);
			} );
		} );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=get', json: true } )
				.reply( 200, { data: getResponse } );
		} );

		test( 'should dispatch a function for success', () => {
			const store = {
				dispatch: spy(),
			};

			const onSuccess = ( dispatch, getState, data ) => {
				dispatch( {
					type: '%%ON_SUCCESS_FUNCTION%%',
					data,
				} );
			};

			const action = get( siteId, 'placeholder_endpoint', onSuccess );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: getResponse } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: '%%ON_SUCCESS_FUNCTION%%' } ).and( match.has( 'data' ) )
				);
			} );
		} );

		test( 'should dispatch a function for failure', () => {
			const store = {
				dispatch: spy(),
			};

			const onFailure = ( dispatch, getState, error ) => {
				dispatch( {
					type: '%%ON_FAILURE_FUNCTION%%',
					error,
				} );
			};

			const action = get( siteId, 'bad_placeholder_endpoint', null, onFailure );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledThrice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_ERROR_SET } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } ).and(
						match.has( 'error' )
					)
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: '%%ON_FAILURE_FUNCTION%%' } ).and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#post', () => {
		const postResponse = { name: 'placeholder post response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=post', json: true } )
				.reply( 200, { data: postResponse } );
		} );

		const body = { name: 'post request', placeholder: true };

		test( 'should handle post success', () => {
			const store = {
				dispatch: spy(),
			};

			const onSuccessAction = {
				type: '%%ON_SUCCESS_ACTION%%',
			};

			const action = post( siteId, 'placeholder_endpoint', body, onSuccessAction );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: postResponse } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onSuccessAction.type } ).and( match.has( 'data' ) )
				);
			} );
		} );

		test( 'should handle post failure', () => {
			const store = {
				dispatch: spy(),
			};

			const onFailureAction = {
				type: '%%ON_FAILURE_ACTION%%',
			};

			const action = post( siteId, 'bad_placeholder_endpoint', body, null, onFailureAction );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledThrice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_ERROR_SET } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } ).and(
						match.has( 'error' )
					)
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onFailureAction.type } ).and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#put', () => {
		const putResponse = { name: 'placeholder put response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=put', json: true } )
				.reply( 200, { data: putResponse } );
		} );

		const body = { name: 'put request', placeholder: true };

		test( 'should handle put success', () => {
			const store = {
				dispatch: spy(),
			};

			const onSuccessAction = {
				type: '%%ON_SUCCESS_ACTION%%',
			};

			const action = put( siteId, 'placeholder_endpoint', body, onSuccessAction );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: putResponse } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onSuccessAction.type } ).and( match.has( 'data' ) )
				);
			} );
		} );

		test( 'should handle put failure', () => {
			const store = {
				dispatch: spy(),
			};

			const onFailureAction = {
				type: '%%ON_FAILURE_ACTION%%',
			};

			const action = put( siteId, 'bad_placeholder_endpoint', body, null, onFailureAction );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledThrice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_ERROR_SET } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } ).and(
						match.has( 'error' )
					)
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onFailureAction.type } ).and( match.has( 'error' ) )
				);
			} );
		} );
	} );

	describe( '#delete', () => {
		const deleteResponse = { name: 'placeholder delete response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=delete', json: true } )
				.reply( 200, { data: deleteResponse } );
		} );

		test( 'should handle delete success', () => {
			const store = {
				dispatch: spy(),
			};

			const onSuccessAction = {
				type: '%%ON_SUCCESS_ACTION%%',
			};

			const action = del( siteId, 'placeholder_endpoint', onSuccessAction );

			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledTwice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_SUCCESS, action, data: deleteResponse } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onSuccessAction.type } ).and( match.has( 'data' ) )
				);
			} );
		} );

		test( 'should handle delete failure', () => {
			const store = {
				dispatch: spy(),
			};

			const onFailureAction = {
				type: '%%ON_FAILURE_ACTION%%',
			};

			const action = del( siteId, 'bad_placeholder_endpoint', null, onFailureAction );
			return handleRequest( store, action ).then( () => {
				expect( store.dispatch ).to.have.been.calledThrice;
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_ERROR_SET } )
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: WOOCOMMERCE_API_REQUEST_FAILURE, action: action } ).and(
						match.has( 'error' )
					)
				);
				expect( store.dispatch ).to.have.been.calledWith(
					match( { type: onFailureAction.type } ).and( match.has( 'error' ) )
				);
			} );
		} );
	} );
} );
