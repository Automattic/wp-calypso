/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Returns true if the media is being requested for a specified site ID and media ID.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {object}  mediaId Media ID
 * @returns {boolean}            True if the media is being requested
 */
export default function isRequestingMediaItem( state, siteId, mediaId ) {
	return get( state.media.fetching, [ siteId, 'items', mediaId ], false );
}
