import { createSelector } from '@automattic/state-utils';

import 'calypso/state/data-layer/wpcom/sites/scan/threat-counts';

/**
 * Returns true if we are currently making a request to retrieve Jetpack Scan threat counts. False otherwise.
 * Returns false if the site is unknown, or there is no information yet.
 * @param  {Object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the connection data is being requested
 */
export default createSelector(
	( state, siteId ) => state.jetpackScan.threatCounts.requestStatus?.[ siteId ] === 'pending',
	( state, siteId ) => [ state.jetpackScan?.threatCounts?.requestStatus?.[ siteId ] ]
);
