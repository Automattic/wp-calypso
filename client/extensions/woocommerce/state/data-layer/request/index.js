/**
 * External dependencies
 */

import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
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

	return request( siteId )
		[ method ]( path, body )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_API_REQUEST_SUCCESS,
				action,
				data,
			} );

			dispatchWithProps( dispatch, getState, onSuccessAction, { data } );
		} )
		.catch( ( error ) => {
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
