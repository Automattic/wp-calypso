/**
 * Internal dependencies
 */
import { isSingleUserSite } from 'state/sites/selectors';

/**
 * Returns true if every site of the current user is a single user site
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       True if all sites are single user sites
 */
export default function areAllSitesSingleUser( state ) {
	const siteIds = Object.keys( state.sites.items );
	return siteIds && siteIds.every( ( siteId ) => isSingleUserSite( state, siteId ) );
}
