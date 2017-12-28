/**
 * Returns a media object by site ID, media ID, or null if not known
 *
 *
 * @format
 * @param {Number}  mediaId Media ID
 * @return {?Object}         Media object, if known
 */

export default function getMediaItem( state, siteId, mediaId ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	return queries.getItem( mediaId ) || null;
}
