/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check.
 * @return {array|string|false} List of orders, LOADING if still loading, or false if there was an error
 */
const getRawOrders = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list has been successfully loaded from the server
 */
export const areOrdersLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawOrders( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list is currently being retrieved from the server
 */
export const areOrdersLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawOrders( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array|false} List of orders, or false if there was an error
 */
export const getOrders = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areOrdersLoaded( state, siteId ) ) {
		return [];
	}

	return getRawOrders( state, siteId );
};
