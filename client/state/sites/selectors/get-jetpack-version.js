import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the Jetpack version for the given site.
 *
 * @param  {Object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?string}         Jetpack version
 */
export default function getJetpackVersion( state, siteId ) {
	if ( isJetpackSite( state, siteId ) ) {
		return getSite( state, siteId )?.options?.jetpack_version ?? null;
	}

	return null;
}
