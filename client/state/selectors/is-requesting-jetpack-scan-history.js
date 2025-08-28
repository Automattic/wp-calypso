import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';

import 'calypso/state/data-layer/wpcom/sites/scan/history';

/**
 * Returns true if we are currently making a request to retrieve Jetpack Scan History. False otherwise.
 * Returns false if the site is unknown, or there is no information yet.
 * @param  {Object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the connection data is being requested
 */
export default createSelector(
	( state, siteId ) =>
		get( state.jetpackScan.history.requestStatus, [ siteId ], false ) === 'pending',
	( state, siteId ) => [ state.jetpackScan?.history?.requestStatus?.[ siteId ] ]
);
