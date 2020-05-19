/**
 * External dependencies
 */
import { get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { statusWaitingPayment, statusWaitingFulfillment } from 'woocommerce/lib/order-status';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the count data is already loaded for this site
 */
export const areCountsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, `extensions.woocommerce.sites[${ siteId }].data.counts.isLoading` );
	return false === isLoading;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the count data is currently being retrieved from the server
 */
export const areCountsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, `extensions.woocommerce.sites[${ siteId }].data.counts.isLoading` );
	return true === isLoading;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The total number of products on this site
 */
export const getCountProducts = ( state, siteId = getSelectedSiteId( state ) ) => {
	const items = get( state, `extensions.woocommerce.sites[${ siteId }].data.counts.items`, {} );
	return get( items, 'products.all', 0 );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The total number of not-finished orders (awaiting payment & fulfullment) on this site
 */
export const getCountNewOrders = ( state, siteId = getSelectedSiteId( state ) ) => {
	const items = get( state, `extensions.woocommerce.sites[${ siteId }].data.counts.items`, {} );
	const statuses = [ ...statusWaitingPayment, ...statusWaitingFulfillment ].map(
		( s ) => `wc-${ s }`
	);
	return reduce( statuses, ( total, s ) => total + get( items, `orders.${ s }`, 0 ), 0 );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The number of pending reviews on this site
 */
export const getCountPendingReviews = ( state, siteId = getSelectedSiteId( state ) ) => {
	const items = get( state, `extensions.woocommerce.sites[${ siteId }].data.counts.items`, {} );
	return get( items, 'reviews.awaiting_moderation', 0 );
};
