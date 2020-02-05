/**
 * External dependencies
 */

import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_API_REQUEST } from 'woocommerce/state/action-types';

function _createRequestAction( method, siteId, path, body, onSuccessAction, onFailureAction ) {
	const action = {
		type: WOOCOMMERCE_API_REQUEST,
		requestId: uniqueId( 'request_' ),
		method,
		siteId,
		path,
		body,
		onSuccessAction,
		onFailureAction,
	};

	return action;
}

/**
 * Performs HTTP GET in data-layer handlers and dispatches appropriate success/failure actions.
 *
 * @param {number} siteId id for the WooCommerce site.
 * @param {string} path API endpoint
 * @param {object|Function} [onSuccessAction] Action with extra props { data }
 * @param {object|Function} [onFailureAction] Action with extra props { error }
 * @returns {Promise<object>} A promise to the action (only used for testing)
 */
export function get( siteId, path, onSuccessAction, onFailureAction ) {
	return _createRequestAction( 'get', siteId, path, undefined, onSuccessAction, onFailureAction );
}

/**
 * Performs HTTP POST in data-layer handlers and dispatches appropriate success/failure actions.
 *
 * @param {number} siteId id for the WooCommerce site.
 * @param {string} path API endpoint
 * @param {object} body JS Object that will be converted to JSON for the HTTP Body
 * @param {object|Function} [onSuccessAction] Action with extra props { data }
 * @param {object|Function} [onFailureAction] Action with extra props { error }
 * @returns {Promise<object>} A promise to the action (only used for testing)
 */
export function post( siteId, path, body, onSuccessAction, onFailureAction ) {
	return _createRequestAction( 'post', siteId, path, body, onSuccessAction, onFailureAction );
}

/**
 * Performs HTTP PUT in data-layer handlers and dispatches appropriate success/failure actions.
 *
 * @param {number} siteId id for the WooCommerce site.
 * @param {string} path API endpoint
 * @param {object} body JS Object that will be converted to JSON for the HTTP Body
 * @param {object|Function} [onSuccessAction] Action with extra props { data }
 * @param {object|Function} [onFailureAction] Action with extra props { error }
 * @returns {Promise<object>} A promise to the action (only used for testing)
 */
export function put( siteId, path, body, onSuccessAction, onFailureAction ) {
	return _createRequestAction( 'put', siteId, path, body, onSuccessAction, onFailureAction );
}

/**
 * Performs HTTP DELETE in data-layer handlers and dispatches appropriate success/failure actions.
 *
 * @param {number} siteId id for the WooCommerce site.
 * @param {string} path API endpoint
 * @param {object|Function} [onSuccessAction] Action with extra props { data }
 * @param {object|Function} [onFailureAction] Action with extra props { error }
 * @returns {Promise<object>} A promise to the action (only used for testing)
 */
export function del( siteId, path, onSuccessAction, onFailureAction ) {
	return _createRequestAction( 'del', siteId, path, undefined, onSuccessAction, onFailureAction );
}
