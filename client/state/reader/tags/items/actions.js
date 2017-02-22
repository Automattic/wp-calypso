/**
 * External dependencies
 */
import { kebabCase } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_REQUEST,
	READER_TAGS_RECEIVE,
} from 'state/action-types';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {String} tag  Tag name to parse into a slug
 * @return {String}      Tag slug
 */
const slugify = ( tag ) => encodeURIComponent( kebabCase( tag ) );

export const requestTags = tag => {
	const type = READER_TAGS_REQUEST;
	if ( ! tag ) {
		return { type };
	}

	const slug = slugify( tag );
	return {
		type,
		payload: { tag, slug },
	};
};

export const receiveTags = ( { payload, error } ) => ( {
	type: READER_TAGS_RECEIVE,
	payload,
	error,
} );
