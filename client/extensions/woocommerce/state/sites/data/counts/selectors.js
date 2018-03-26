/** @format */
/**
 * External dependencies
 */
import { get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';
import { statusWaitingPayment, statusWaitingFulfillment } from 'woocommerce/lib/order-status';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The count data, as retrieved from the server. It can also be the string "LOADING" if the
 * counts are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
const getRawData = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, `extensions.woocommerce.sites[${ siteId }].data.counts` );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the count data is already loaded for this site
 */
export const areCountsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const counts = getRawData( state, siteId );
	return 'not-loaded' !== get( counts, 'products', 'not-loaded' );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the count data is currently being retrieved from the server
 */
export const areCountsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawData( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} The total number of products on this site
 */
export const getCountProducts = ( state, siteId = getSelectedSiteId( state ) ) => {
	const counts = getRawData( state, siteId );
	return get( counts, 'products.all', 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} The total number of not-finished orders (awaiting payment & fulfullment) on this site
 */
export const getCountNewOrders = ( state, siteId = getSelectedSiteId( state ) ) => {
	const counts = getRawData( state, siteId );
	const statuses = [ ...statusWaitingPayment, ...statusWaitingFulfillment ].map( s => `wc-${ s }` );
	return reduce( statuses, ( total, s ) => total + get( counts, `orders.${ s }`, 0 ), 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} The number of pending reviews on this site
 */
export const getCountPendingReviews = ( state, siteId = getSelectedSiteId( state ) ) => {
	const counts = getRawData( state, siteId );
	return get( counts, 'reviews.awaiting_moderation', 0 );
};
