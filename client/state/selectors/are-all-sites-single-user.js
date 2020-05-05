/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';
import { isSingleUserSite } from 'state/sites/selectors';

/**
 * Returns true if every site of the current user is a single user site
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       True if all sites are single user sites
 */
export default createSelector( ( state ) => {
	const siteIds = Object.keys( getSitesItems( state ) );
	return !! siteIds.length && siteIds.every( ( siteId ) => isSingleUserSite( state, siteId ) );
}, getSitesItems );
