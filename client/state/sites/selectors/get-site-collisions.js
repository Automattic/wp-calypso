import { createSelector } from '@automattic/state-utils';
import { getJetpackSiteCollisions } from 'calypso/lib/site/utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 *
 * @param  {Object}   state Global state tree
 * @returns {number[]}       WordPress.com site IDs with collisions
 */
export default createSelector( ( state ) => {
	const sitesItems = Object.values( getSitesItems( state ) );
	return getJetpackSiteCollisions( sitesItems );
}, getSitesItems );
