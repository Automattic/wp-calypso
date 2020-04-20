/**
 * External dependencies
 */

import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';
import isMainSiteOf from 'state/selectors/is-main-site-of';
import { getSite, isJetpackSiteMainNetworkSite } from 'state/sites/selectors';

/**
 * Returns the member sites (main or secondary) of given network site
 * Returns null if main site is not found or if the site is not a main site of a network
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  mainSiteId  The ID of the main site for which we're retrieving the network sites
 * @returns {?Array}              Array of network sites (the main one and the secondary ones)
 */
export default createSelector(
	( state, mainSiteId ) => {
		if ( ! isJetpackSiteMainNetworkSite( state, mainSiteId ) ) {
			return null;
		}

		return filter(
			getSitesItems( state ),
			( site ) => mainSiteId === site.ID || isMainSiteOf( state, mainSiteId, site.ID )
		).map( ( site ) => getSite( state, site.ID ) );
	},
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
