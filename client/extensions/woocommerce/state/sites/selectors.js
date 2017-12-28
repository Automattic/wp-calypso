/** @format */

/**
 * Internal dependencies
 */

import { getCurrentUserSiteCount } from 'client/state/current-user/selectors';
import { getPrimarySiteId } from 'client/state/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getSite } from 'client/state/sites/selectors';

/**
 * Gets currently selected site or, if that isn't available and the user has
 * just one site, returns the user's primary site as a fallback
 *
 * @param {Object} state Global state tree
 * @return {?Object} Site
 */
export function getSelectedSiteWithFallback( state ) {
	let siteId = getSelectedSiteId( state );
	if ( ! siteId && 1 === getCurrentUserSiteCount( state ) ) {
		siteId = getPrimarySiteId( state );
	}
	return getSite( state, siteId );
}
