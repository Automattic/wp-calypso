/**
 * External dependencies
 */
import { get, isObject, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Object} The ID of the current order (or object placeholder, if a new order)
 */
export const getCurrentlyEditingOrderId = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'edits', 'currentlyEditingId' ], null );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} The current page being shown to the user. Defaults to 1.
 */
export const getOrdersCurrentPage = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'list', 'currentPage' ], 1 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} The current search term being shown to the user. Defaults to "".
 */
export const getOrdersCurrentSearch = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'list', 'currentSearch' ], '' );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The local edits made to the current order
 */
export const getOrderEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'edits', 'changes' ], {} );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The order merged with changes, or just the changes if a newly created order
 */
export const getOrderWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	const orderId = getCurrentlyEditingOrderId( state, siteId );
	const orderEdits = getOrderEdits( state, siteId );

	// If there is no existing order, the edits are returned as the entire order.
	if ( isObject( orderId ) ) {
		return { ...orderEdits, id: orderId };
	}

	const order = getOrder( state, orderId, siteId );
	// We haven't synced the order yet, so return with just the changes.
	if ( ! order ) {
		return orderEdits;
	}

	return merge( {}, order, orderEdits );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} True if there is an order ID tracked as "editing"
 */
export const isCurrentlyEditingOrder = ( state, siteId = getSelectedSiteId( state ) ) => {
	return !! getCurrentlyEditingOrderId( state, siteId );
};
