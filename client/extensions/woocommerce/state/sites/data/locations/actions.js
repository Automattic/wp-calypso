/**
 * Internal dependencies
 */
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export function fetchLocations( siteId ) {
	return {
		type: WOOCOMMERCE_LOCATIONS_REQUEST,
		siteId,
	};
}

export function locationsFailure( siteId, error = false ) {
	const action = fetchLocations( siteId );
	return setError( siteId, action, error );
}

export function locationsReceive( siteId, data ) {
	return {
		type: WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
		siteId,
		data,
	};
}
