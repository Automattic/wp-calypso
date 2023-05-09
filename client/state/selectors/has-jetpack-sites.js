import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns true if the user has one or more Jetpack sites, and false otherwise.
 *
 * @param {Object} state  Global state tree
 * @returns {boolean} Whether Jetpack sites exist or not
 */
export default createSelector( ( state ) => {
	const siteIds = Object.keys( getSitesItems( state ) );
	return siteIds.some( ( siteId ) => isJetpackSite( state, siteId ) );
}, getSitesItems );
