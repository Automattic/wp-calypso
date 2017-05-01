/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_ERROR,
	WOOCOMMERCE_API_ERROR_CLEAR,
} from '../action-types';

export function error( siteId, originalAction, data, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_API_ERROR,
		payload: { siteId, originalAction, data, time },
	};
}

export function clearError( siteId ) {
	return {
		type: WOOCOMMERCE_API_ERROR_CLEAR,
		payload: { siteId },
	};
}
