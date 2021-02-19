/**
 * External dependencies
 */

import { get, isObject, merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrencyFormatString } from 'woocommerce/lib/currency';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number|object} The ID of the current order (or object placeholder, if a new order)
 */
export const getCurrentlyEditingOrderId = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'edits', 'currentlyEditingId' ],
		null
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The current page being shown to the user. Defaults to 1.
 */
export const getOrdersCurrentPage = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'list', 'currentPage' ],
		1
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The current search term being shown to the user. Defaults to "".
 */
export const getOrdersCurrentSearch = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'list', 'currentSearch' ],
		''
	);
};

/**
 * Get a default order "frame", so we have values for components.
 *
 * @returns {object} The local edits made to the current order
 */
export const getDefaultEmptyOrder = () => {
	const currency = 'USD';
	const zero = getCurrencyFormatString( 0, currency );

	return {
		status: 'pending',
		currency: currency,
		discount_total: zero,
		discount_tax: zero,
		shipping_total: zero,
		shipping_tax: zero,
		cart_tax: zero,
		total: zero,
		total_tax: zero,
		prices_include_tax: false,
		billing: {},
		shipping: {},
		payment_method: 'calypso_manual',
		payment_method_title: translate( 'Manual Payment' ),
		line_items: [],
		tax_lines: [],
		shipping_lines: [],
		fee_lines: [],
		coupon_lines: [],
		refunds: [],
	};
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The local edits made to the current order
 */
export const getOrderEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'edits', 'changes' ],
		{}
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The order merged with changes, or just the changes if a newly created order
 */
export const getOrderWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	const orderId = getCurrentlyEditingOrderId( state, siteId );
	const orderEdits = getOrderEdits( state, siteId );

	// If there is no existing order, the edits are returned as the entire order.
	if ( isObject( orderId ) ) {
		const emptyOrder = getDefaultEmptyOrder();
		return { ...emptyOrder, ...orderEdits, id: orderId };
	}

	const order = getOrder( state, orderId, siteId );
	// We haven't synced the order yet, so return with just the changes.
	if ( ! order ) {
		return orderEdits;
	}

	return merge( {}, order, orderEdits );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} True if there is an order ID tracked as "editing"
 */
export const isCurrentlyEditingOrder = ( state, siteId = getSelectedSiteId( state ) ) => {
	return !! getCurrentlyEditingOrderId( state, siteId );
};
