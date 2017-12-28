/** @format */

/**
 * Internal dependencies
 */

import createSelector from 'client/lib/create-selector';
import { isJetpackSite } from 'client/state/sites/selectors';
import { getSitesItems } from 'client/state/selectors';

/**
 * Returns true if the user has one or more Jetpack sites, and false otherwise.
 *
 * @param {Object} state  Global state tree
 * @return {Boolean} Whether Jetpack sites exist or not
 */
export default createSelector( state => {
	const siteIds = Object.keys( getSitesItems( state ) );
	return siteIds.some( siteId => isJetpackSite( state, siteId ) );
}, getSitesItems );
