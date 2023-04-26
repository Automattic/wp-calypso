import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isSingleUserSite } from 'calypso/state/sites/selectors';

/**
 * Returns true if every site of the current user is a single user site
 *
 * @param  {Object}  state Global state tree
 * @returns {boolean}       True if all sites are single user sites
 */
export default createSelector( ( state ) => {
	const siteIds = Object.keys( getSitesItems( state ) );
	return !! siteIds.length && siteIds.every( ( siteId ) => isSingleUserSite( state, siteId ) );
}, getSitesItems );
