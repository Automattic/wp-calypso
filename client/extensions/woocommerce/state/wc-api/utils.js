/** @format */

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

export function dispatchRequest( initiator, onSuccess, onFailure ) {
	return dataLayerDispatchRequest(
		initiator,
		apiSuccess( onSuccess, onFailure ),
		apiFailure( onFailure )
	);
}

export function apiSuccess( onSuccess, onFailure ) {
	return function apiSuccessHandler( store, action, response ) {
		const { data } = response;

		switch ( data.status ) {
			case 200:
				store.dispatch( {
					type: WOOCOMMERCE_WC_API_SUCCESS,
					siteId: action.siteId,
					action,
				} );
				onSuccess( store, action, response );
				break;
			case 404:
				debug( 'API Unavailable: ', data );
				// This means the woocommerce API endpoint requested is not available.
				// Most likely, the woocommerce plugin is disabled.
				store.dispatch( {
					type: WOOCOMMERCE_WC_API_UNAVAILABLE,
					siteId: action.siteId,
					action,
				} );

				// TODO: Log to logstash

				onFailure( store, action, response );
				break;
			default:
				debug( 'Unrecognized site error: ', data );

				store.dispatch( {
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

				onFailure( store, action, response );
				break;
		}
	};
}

export function apiFailure( onFailure ) {
	return function apiErrorHandler( store, action, error ) {
		debug( 'Unrecognized API Error: ' + JSON.stringify( error ) );

		store.dispatch( {
			type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
			siteId: action.siteId,
			action,
			error,
		} );

		onFailure( store, action, error );

		if ( action.failureAction ) {
			store.dispatch( action.failureAction );
		}
	};
}
