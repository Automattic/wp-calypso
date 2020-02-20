/**
 * Internal dependencies
 */

import { WOOCOMMERCE_ERROR_SET, WOOCOMMERCE_ERROR_CLEAR } from 'woocommerce/state/action-types';

export function setError( siteId, originalAction, data, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ERROR_SET,
		siteId,
		originalAction,
		data,
		time,
	};
}

export function clearError( siteId ) {
	return {
		type: WOOCOMMERCE_ERROR_CLEAR,
		siteId,
	};
}
