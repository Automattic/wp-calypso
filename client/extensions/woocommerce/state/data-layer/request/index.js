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

export function handleRequest( { dispatch }, action ) {
	const { method, siteId, path, body } = action;

	return request( siteId )[ method ]( path, body )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_SUCCESS,
				action,
				data,
			} );

			if ( action.onSuccessAction ) {
				// Append data and dispatch.
				const onSuccess = { ...action.onSuccessAction, data };
				dispatch( onSuccess );
			}
		} )
		.catch( error => {
			// TODO: Maybe phase out usage of this in favor of the failure action?
			dispatch( setError( siteId, action, { message: error.toString() } ) );
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_FAILURE,
				action,
				error,
			} );

			if ( action.onFailureAction ) {
				// Append error and dispatch.
				const onFailure = { ...action.onFailureAction, error };
				dispatch( onFailure );
			}
		} );
}

export default {
	[ WOOCOMMERCE_API_REQUEST ]: [ handleRequest ],
};

