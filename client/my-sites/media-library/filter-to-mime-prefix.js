/**
 * Given a media filter, returns the associated mime type prefix, or undefined
 * if media filter isn't supported.
 *
 * This nearly duplicates existing behavior in <MediaListData /> utility
 * library, but does not include the `/` suffix required for REST API
 * filtering, but not utilized in MediaLibrary mime prefix detection.
 *
 *
 *
 * @see /client/components/data/media-list-data/utils.js
 * @param {string} filter Media filter path segment
 * @returns {string}        Media mime type prefix
 */

export default function ( filter ) {
	let mimePrefix;

	switch ( filter ) {
		case 'images':
			mimePrefix = 'image';
			break;
		case 'audio':
			mimePrefix = 'audio';
			break;
		case 'videos':
			mimePrefix = 'video';
			break;
		case 'documents':
			mimePrefix = 'application';
			break;
	}

	return mimePrefix;
}
