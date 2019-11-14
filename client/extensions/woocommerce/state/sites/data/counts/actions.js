/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_COUNT_REQUEST,
	WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
	WOOCOMMERCE_COUNT_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

export function fetchCounts( siteId ) {
	return {
		type: WOOCOMMERCE_COUNT_REQUEST,
		siteId,
	};
}

export function fetchCountsFailure( siteId, error ) {
	return {
		type: WOOCOMMERCE_COUNT_REQUEST_FAILURE,
		siteId,
		error,
	};
}

export function fetchCountsSuccess( siteId, counts ) {
	return {
		type: WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
		siteId,
		counts,
	};
}
