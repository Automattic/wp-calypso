/**
 * Returns a media object by site ID, media ID, or null if not known
 *
 *
 * @param {number}  mediaId Media ID
 * @returns {?object}         Media object, if known
 */

export default function getMediaItem( state, siteId, mediaId ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	const media = queries.getItem( mediaId ) || null;
	if ( media === null ) {
		return null;
	}
	// If media doesn't have a URL parameter then it is not an attachment but a post.
	return media.URL ? media : null;
}
