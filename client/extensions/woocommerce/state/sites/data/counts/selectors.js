/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { statusWaitingPayment, statusWaitingFulfillment } from 'woocommerce/lib/order-status';

function getItems( state, siteId ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.data.counts.items ?? {};
}

function isLoading( state, siteId ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.data.counts.isLoading;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the count data is already loaded for this site
 */
export function areCountsLoaded( state, siteId = getSelectedSiteId( state ) ) {
	return isLoading( state, siteId ) === false;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the count data is currently being retrieved from the server
 */
export function areCountsLoading( state, siteId = getSelectedSiteId( state ) ) {
	return isLoading( state, siteId ) === true;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The total number of products on this site
 */
export function getCountProducts( state, siteId = getSelectedSiteId( state ) ) {
	const items = getItems( state, siteId );
	return items?.products?.all ?? 0;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The total number of not-finished orders (awaiting payment & fulfullment) on this site
 */
export function getCountNewOrders( state, siteId = getSelectedSiteId( state ) ) {
	const items = getItems( state, siteId );
	const statuses = [ ...statusWaitingPayment, ...statusWaitingFulfillment ].map(
		( s ) => `wc-${ s }`
	);
	return statuses.reduce( ( total, s ) => total + ( items?.orders?.[ s ] ?? 0 ), 0 );
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The number of pending reviews on this site
 */
export function getCountPendingReviews( state, siteId = getSelectedSiteId( state ) ) {
	const items = getItems( state, siteId );
	return items?.reviews?.awaiting_moderation ?? 0;
}
