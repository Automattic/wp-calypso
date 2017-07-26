/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} The current page being shown to the user. Defaults to 1.
 */
export const getOrdersCurrentPage = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'currentPage' ], 1 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} The current status filter being shown to the user. Defaults to "any".
 */
export const getOrdersCurrentStatus = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'orders', siteId, 'currentStatus' ], 'any' );
};
