/**
 * External dependencies
 */
import { get, filter, omit, sumBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSerializedOrdersQuery } from './utils';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch orders. Can contain page, status, etc. If not provided, defaults to first page, all orders.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the orders list has been successfully loaded from the server
 */
export const areOrdersLoaded = ( state, query, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedOrdersQuery( query );
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isQueryLoading', serializedQuery ] );
	// Strict check because it could also be undefined.
	return ( false === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch orders. Can contain page, status, etc. If not provided, defaults to first page, all orders.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the orders list is currently being retrieved from the server
 */
export const areOrdersLoading = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedOrdersQuery( query );
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isQueryLoading', serializedQuery ] );
	// Strict check because it could also be undefined.
	return ( true === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} orderId Order ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the orders list has been successfully loaded from the server
 */
export const isOrderLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isLoading', orderId ] );
	// Strict check because it could also be undefined.
	return ( false === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} orderId Order ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether this order is currently being retrieved from the server
 */
export const isOrderLoading = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isLoading', orderId ] );
	// Strict check because it could also be undefined.
	return ( true === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} orderId Order ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether this order is currently being updated on the server
 */
export const isOrderUpdating = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isUpdating = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isUpdating', orderId ] );
	return !! isUpdating;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch orders. Can contain page, status, etc. If not provided, defaults to first page, all orders.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array|false} List of orders, or false if there was an error
 */
export const getOrders = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areOrdersLoaded( state, query, siteId ) ) {
		return [];
	}
	const serializedQuery = getSerializedOrdersQuery( query );
	const orders = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'items' ], {} );
	const orderIdsOnPage = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'queries', serializedQuery ], [] );
	if ( orderIdsOnPage.length ) {
		return orderIdsOnPage.map( id => orders[ id ] );
	}
	return false;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} orderId ID number of an order
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object|Null} The requested order object, or null if not available
 */
export const getOrder = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'items', orderId ], null );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch orders. Can contain page, status, etc. If not provided, defaults to first page, all orders.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of orders available on a site, or 0 if not loaded yet.
 */
export const getTotalOrders = ( state, query = {}, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedOrdersQuery( omit( query, 'page' ) );
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'total', serializedQuery ], 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array} List of new orders.
 */
export const getNewOrders = ( state, siteId = getSelectedSiteId( state ) ) => {
	// TODO: fetchOrders right now loads max number of orders, as pagination won't be supported until post v1
	// We will possibly need to get this data another way once that behavior changes.
	if ( ! areOrdersLoaded( state, 1, siteId ) ) {
		return [];
	}

	const orders = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'items' ], {} );
	return filter( orders, function( order ) {
		const { status } = order;
		return 'pending' === status || 'processing' === status || 'on-hold' === status;
	} );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total from all new orders.
 */
export const getNewOrdersRevenue = ( state, siteId = getSelectedSiteId( state ) ) => {
	const orders = getNewOrders( state, siteId );
	return sumBy( orders, order => parseFloat( order.total ) );
};
