/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_WC_API_SUCCESS,
	WOOCOMMERCE_WC_API_UNAVAILABLE,
	WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:wc-api' );

import { dispatchRequest as dataLayerDispatchRequest } from 'state/data-layer/wpcom-http/utils';

export function dispatchRequest( fetch, onSuccess, onError ) {
	return dataLayerDispatchRequest( {
		fetch,
		onSuccess: apiSuccess( onSuccess, onError ),
		onError: apiFailure( onError ),
	} );
}

export function apiSuccess( onSuccess, onFailure ) {
	return function apiSuccessHandler( action, response ) {
		return ( dispatch ) => {
			const { data } = response;

			switch ( data.status ) {
				case 200:
					dispatch( {
						type: WOOCOMMERCE_WC_API_SUCCESS,
						siteId: action.siteId,
						action,
					} );
					onSuccess( { dispatch }, action, response );
					break;
				case 404:
					debug( 'API Unavailable: ', data );
					// This means the woocommerce API endpoint requested is not available.
					// Most likely, the woocommerce plugin is disabled.
					dispatch( {
						type: WOOCOMMERCE_WC_API_UNAVAILABLE,
						siteId: action.siteId,
						action,
					} );

					// TODO: Log to logstash

					onFailure( { dispatch }, action, response );
					break;
				default:
					debug( 'Unrecognized site error: ', data );

					dispatch( {
						type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
						siteId: action.siteId,
						action,
						error: {
							status: data.status,
							code: data.body.code,
							message: data.body.message,
						},
					} );

					// TODO: Log to logstash

					onFailure( { dispatch }, action, response );
					break;
			}
		};
	};
}

export function apiFailure( onFailure ) {
	return function apiErrorHandler( action, error ) {
		return ( dispatch ) => {
			debug( 'Unrecognized API Error: ' + JSON.stringify( error ) );

			dispatch( {
				type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
				siteId: action.siteId,
				action,
				error,
			} );

			onFailure( { dispatch }, action, error );

			if ( action.failureAction ) {
				dispatch( action.failureAction );
			}
		};
	};
}
