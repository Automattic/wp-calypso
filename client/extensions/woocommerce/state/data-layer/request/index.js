/**
 * External dependencies
 */
import { isFunction, isObject } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';

import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_API_REQUEST_SUCCESS,
	WOOCOMMERCE_API_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:request' );

export function handleRequest( { dispatch, getState }, action ) {
	const { method, siteId, path, body, onSuccessAction, onFailureAction } = action;

	return request( siteId )[ method ]( path, body )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_SUCCESS,
				action,
				data,
			} );

			// TODO: Make this a utility function.
			if ( isFunction( onSuccessAction ) ) {
				// Dispatch with an extra data parameter.
				return onSuccessAction( dispatch, getState, data );
			} else if ( isObject( onSuccessAction ) ) {
				// Append data and dispatch.
				dispatch( { ...onSuccessAction, data } );
			}
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

			// TODO: Make this a utility function.
			if ( isFunction( onFailureAction ) ) {
				// Dispatch with an extra error paramter.
				return onFailureAction( dispatch, getState, error );
			} else if ( isObject( onFailureAction ) ) {
				// Append error and dispatch.
				dispatch( { ...action.onFailureAction, error } );
			}
		} );
}

export default {
	[ WOOCOMMERCE_API_REQUEST ]: [ handleRequest ],
};

