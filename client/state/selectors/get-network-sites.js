/** @format */

/**
 * External dependencies
 */

import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'client/lib/create-selector';
import { isMainSiteOf, getSitesItems } from 'client/state/selectors';
import { getSite, isJetpackSiteMainNetworkSite } from 'client/state/sites/selectors';

/**
 * Returns the member sites (main or secondary) of given network site
 * Returns null if main site is not found or if the site is not a main site of a network
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  mainSiteId  The ID of the main site for which we're retrieving the network sites
 * @return {?Array}              Array of network sites (the main one and the secondary ones)
 */
export default createSelector(
	( state, mainSiteId ) => {
		if ( ! isJetpackSiteMainNetworkSite( state, mainSiteId ) ) {
			return null;
		}

		return filter(
			getSitesItems( state ),
			site => mainSiteId === site.ID || isMainSiteOf( state, mainSiteId, site.ID )
		).map( site => getSite( state, site.ID ) );
	},
	state => [ getSitesItems( state ), state.currentUser.capabilities ]
);
