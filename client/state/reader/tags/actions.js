/**
 * External dependencies
 */
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_TAGS_RECEIVE,
	READER_TAGS_REQUEST,
	READER_TAGS_REQUEST_SUCCESS,
	READER_TAGS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to signal that tag objects have been received.
 *
 * @param  {Array}  tags Tags received
 * @return {Object}       Action object
 */
export function receiveTags( tags ) {
	return {
		type: READER_TAGS_RECEIVE,
		tags
	};
}

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {String} tag  Tag name to parse into a slug
 * @return {String}      Tag slug
 */
export function slugify( tag ) {
  return encodeURIComponent(
    trim( tag )
      .toLowerCase()
      .replace( /\s+/g, '-' )
      .replace( /-{2,}/g, '-' )
  );
}
