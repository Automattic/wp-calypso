/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getCookieAuth } from 'woocommerce/state/sites/auth/selectors';
import { dispatchWithProps } from 'woocommerce/state/helpers';
import request from 'woocommerce/state/sites/request';
import { LOADING } from 'woocommerce/state/constants';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';

import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_API_REQUEST_SUCCESS,
	WOOCOMMERCE_API_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:request' );

export function handleRequest( { dispatch, getState }, action ) {
	const { method, siteId, path, body, onSuccessAction, onFailureAction, isDirect } = action;
	const directAuth = getCookieAuth( getState(), siteId );

	console.log( 'directAuth: ', directAuth );
	if ( isDirect && ( ! directAuth || LOADING === directAuth ) ) {
		console.log( 'no auth, returning error' );
		dispatch( setError( siteId, null, { message: 'Direct request failure: no auth.', method, path, siteId, body, directAuth } ) );
		return;
	} return request( siteId, ( isDirect ? directAuth : false ) )[ method ]( path, body )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_SUCCESS,
				action,
				data,
			} );

			dispatchWithProps( dispatch, getState, onSuccessAction, { data } );
		} )
		.catch( error => {
			debug( 'Caught error while handling request: ', error );

			// TODO: Maybe phase out usage of this in favor of the failure action?
			dispatch( setError( siteId, action, { message: error.toString() } ) );
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_FAILURE,
				action,
				error,
			} );

			dispatchWithProps( dispatch, getState, onFailureAction, { error } );
		} );
}

export default {
	[ WOOCOMMERCE_API_REQUEST ]: [ handleRequest ],
};

