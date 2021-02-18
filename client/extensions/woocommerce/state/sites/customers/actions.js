/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_CUSTOMERS_REQUEST,
	WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
	WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const searchCustomers = ( siteId, searchTerm ) => {
	return {
		type: WOOCOMMERCE_CUSTOMERS_REQUEST,
		siteId,
		searchTerm,
	};
};

export const customersFailure = ( siteId, searchTerm, error = false ) => {
	return {
		type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
		siteId,
		searchTerm,
		error,
	};
};

export const customersReceive = ( siteId, searchTerm, customers ) => {
	// This passed through the API layer successfully, but failed at the remote site.
	if ( ! isArray( customers ) ) {
		return customersFailure( siteId, searchTerm, customers );
	}
	return {
		type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
		siteId,
		searchTerm,
		customers,
	};
};
