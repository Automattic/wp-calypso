/**
 * External dependencies
 */
import isNil from 'lodash/isNil';

/**
 * Internal dependencies
 */
import getTransientMediaItem from 'calypso/state/selectors/get-transient-media-item';
import getMediaItemServerIdFromTransientId from 'calypso/state/selectors/get-media-item-server-id-from-transient-id';
import getMediaQueryManager from 'calypso/state/selectors/get-media-query-manager';

/**
 * Returns a media object by site ID, media ID, or null if not known.
 * Also ensures that if the passed in media ID is a transient ID that
 * the transient item or the corresponding saved media item is correctly
 * returned.
 *
 * @param {number}  mediaId Media ID
 * @returns {?object}         Media object, if known
 */

export default function getMediaItem( state, siteId, mediaId ) {
	const transientMediaItem = getTransientMediaItem( state, siteId, mediaId );
	if ( ! isNil( transientMediaItem ) ) {
		// if a transient media item existed by this ID then that means the item isn't saved yet
		// so we should continue to use the transient item
		return transientMediaItem;
	}

	// if the selector returns null then the `mediaId` we have is confirmed to already
	// be a server ID rather than a transient ID
	const serverId = getMediaItemServerIdFromTransientId( state, siteId, mediaId ) ?? mediaId;

	const queryManager = getMediaQueryManager( state, siteId );

	if ( ! queryManager ) {
		return null;
	}

	const media = queryManager.getItem( serverId ) || null;
	if ( media === null ) {
		return null;
	}
	// If media doesn't have a URL parameter then it is not an attachment but a post.
	return media.URL ? media : null;
}
