/** @format */

/**
 * External dependencies
 */
import qs from 'querystring';

/**
 * Internal dependencies
 */
// TODO: Consolidate this, data-layer/request and sites/http-request after existing code is ported.
import { get } from 'woocommerce/state/data-layer/request/actions';
import { receivedAction, errorAction } from 'woocommerce/rest-api-client/actions';

/**
 * @param {String} namespace The prefix for the API endpoints (e.g. '/wc/v3')
 * @return {Object} Object with functions for HTTP get, post, put and del.
 */
export function createApiMethods( namespace ) {
	return {
		get: ( siteKey, endpoint, ids, data, params ) => {
			const path = endpoint + '?' + qs.stringify( params );
			const onSuccess = receivedAction( siteKey, endpoint );
			const onFailure = errorAction( siteKey, endpoint, ids );
			return get( siteKey, path, onSuccess, onFailure, namespace );
		},
		// TODO: Add support for mutating API calls
	};
}
