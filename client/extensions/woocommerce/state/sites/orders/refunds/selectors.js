/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} List of refund objects
 */
export const getOrderRefunds = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'refunds', orderId, 'items' ],
		[]
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether an order refund has been requested (or completed)
 */
export const isOrderRefunding = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isSaving = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'orders',
		'refunds',
		orderId,
		'isSaving',
	] );
	// Strict check because it could also be undefined.
	return true === isSaving;
};
