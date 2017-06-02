/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_SET_ERROR,
	WOOCOMMERCE_API_CLEAR_ERROR,
} from 'woocommerce/state/action-types';

export function setError( siteId, originalAction, data, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_API_SET_ERROR,
		siteId,
		payload: { originalAction, data, time },
	};
}

export function clearError( siteId ) {
	return {
		type: WOOCOMMERCE_API_CLEAR_ERROR,
		siteId,
	};
}

