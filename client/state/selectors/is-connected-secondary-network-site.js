/** @format */

/**
 * External dependencies
 */

import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { default as createSelector } from 'lib/create-selector';
import { getSitesItems, isMainSiteOf } from 'state/selectors';

/**
 * Returns true if site with id equal to siteId is a connected secondary network site and false otherwise
 * In order for a site to be a connected secondary site its main site also needs to be connected
 * With selector isJetpackSiteSecondaryNetworkSite the main site does not need to be connected
 *
 * @param  {Object}    state     Global state tree
 * @param  {Number}    siteId    The ID of the site we're querying
 * @return {Boolean}             Whether site with id equal to siteId is a connected secondary network site
 */
export default createSelector( ( state, siteId ) => {
	const siteIds = Object.keys( getSitesItems( state ) );
	return some( siteIds, mainSiteId => isMainSiteOf( state, mainSiteId, siteId ) );
}, getSitesItems );
