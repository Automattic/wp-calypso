import { READER_TAGS_RECEIVE } from 'calypso/state/reader/action-types';

import 'calypso/state/reader/init';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 * @param  {string} tag  Tag name to parse into a slug
 * @returns {string}      Tag slug
 */
export const slugify = ( tag ) =>
	typeof tag === 'string'
		? encodeURIComponent( tag.trim().toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' ) )
		: '';

export const receiveTags = ( { payload, resetFollowingData = false } ) => ( {
	type: READER_TAGS_RECEIVE,
	payload,
	meta: { resetFollowingData },
} );
