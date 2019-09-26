/**
 * Internal dependencies
 */
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_CURRENCIES_REQUEST,
	WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export function fetchCurrencies( siteId ) {
	return {
		type: WOOCOMMERCE_CURRENCIES_REQUEST,
		siteId,
	};
}

export function currenciesFailure( siteId, error = false ) {
	const action = fetchCurrencies( siteId );
	return setError( siteId, action, error );
}

export function currenciesReceive( siteId, data ) {
	return {
		type: WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
		siteId,
		data,
	};
}
