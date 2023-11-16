import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the Stats Admin version for the given site.
 * @param  {Object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?string}         Stats Admin version
 */
export default function getJetpackStatsAdminVersion( state, siteId ) {
	if ( isJetpackSite( state, siteId ) ) {
		return getSite( state, siteId )?.options?.stats_admin_version ?? null;
	}

	return null;
}
