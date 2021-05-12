/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Retrieves a transient media item by ID for a given site.
 *
 * @param {object} state The current state.
 * @param {number} siteId The site ID for which to retrieve the transient media item.
 * @param {string} transientMediaId The ID of the transient media to retrieve
 * @returns {?object} Returns the transient media item if it exists for the site; otherwise null.
 */
export default function getTransientMediaItem( state, siteId, transientMediaId ) {
	return state?.media?.transientItems?.[ siteId ]?.transientItems?.[ transientMediaId ];
}
