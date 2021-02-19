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
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} The current page being viewed. Defaults to 1.
 */
export const getReviewsCurrentPage = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentPage' ],
		1
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The current product being viewed. Defaults to null.
 */
export const getReviewsCurrentProduct = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentProduct' ],
		null
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The current search term being viewed. Defaults to an empty string.
 */
export const getReviewsCurrentSearch = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'reviews', siteId, 'list', 'currentSearch' ],
		''
	);
};
