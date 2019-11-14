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
 * @return {Number} The current page being viewed. Defaults to 1.
 */
export const getReviewsCurrentPage = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentPage' ],
		1
	);
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} The current product being viewed. Defaults to null.
 */
export const getReviewsCurrentProduct = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentProduct' ],
		null
	);
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} The current search term being viewed. Defaults to an empty string.
 */
export const getReviewsCurrentSearch = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentSearch' ],
		''
	);
};
