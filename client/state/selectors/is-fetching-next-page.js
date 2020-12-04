/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';

import 'calypso/state/media/init';

export default createSelector(
	/**
	 * Returns true if media is being requested for a specified site ID and query.
	 *
	 * @param {object} state The state object
	 * @param {number} siteId Site ID
	 * @returns {boolean}           True if media is being requested
	 */
	( state, siteId ) => get( state.media.fetching, [ siteId, 'nextPage' ], false ),
	[ ( state, siteId ) => state.media.fetching?.[ siteId ] ]
);
