/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Retrieves the server ID for a given transient ID and site ID.
 *
 * @param {object} state The current state
 * @param {number} siteId The site ID
 * @param {(number|string)} transientId The transient ID of the media item to get the server ID for
 * @returns {?number} The `number` server ID if it exists, null otherwise.
 */
export default function getMediaItemServerIdFromTransientId( state, siteId, transientId ) {
	return state?.media?.transientItems?.[ siteId ]?.transientIdsToServerIds?.[ transientId ];
}
