/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { isMainSiteOf } from 'state/selectors';
import {
	getSite,
	isJetpackSiteMainNetworkSite
} from 'state/sites/selectors';

/**
 * Returns the secondary sites of a given site
 * Returns null if main site is not found or if the site is not a main site
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the main site for which we're retrieving the secondary sites
 * @return {?Array}            Array of secondary sites
 */
export default createSelector(
	( state, siteId ) => {
		const isMainNetworkSite = isJetpackSiteMainNetworkSite( state, siteId );
		if ( ! isMainNetworkSite ) {
			return null;
		}
		const siteIds = Object.keys( get( state, 'sites.items', {} ) );
		return siteIds.filter( secondarySiteId => isMainSiteOf( state, siteId, secondarySiteId ) )
			.map( secondarySiteId => getSite( state, secondarySiteId ) );
	},
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
