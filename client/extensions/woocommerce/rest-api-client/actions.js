
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_CLIENT_ERROR,
	WOOCOMMERCE_API_CLIENT_RECEIVED,
	WOOCOMMERCE_API_CLIENT_REQUESTED,
} from './action-types';

export function requestedAction( siteKey, endpoint, ids ) {
	return {
		type: WOOCOMMERCE_API_CLIENT_REQUESTED,
		apiType: 'woocommerce',
		siteKey,
		endpoint,
		ids,
	};
}

export function receivedAction( siteKey, endpoint, data ) {
	return {
		type: WOOCOMMERCE_API_CLIENT_RECEIVED,
		apiType: 'woocommerce',
		siteKey,
		endpoint,
		data,
	};
}

// TODO: Add support for mutating API calls.

export function errorAction( siteKey, endpoints, ids ) {
	return {
		type: WOOCOMMERCE_API_CLIENT_ERROR,
		apiType: 'woocommerce',
		siteKey,
		endpoints,
		ids,
	};
}
