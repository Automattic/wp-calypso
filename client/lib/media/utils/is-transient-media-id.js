/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Check whether a given string is a transient media ID. Transient media IDs
 * are strings and start with 'media-'. Persisted media IDs are numbers.
 *
 * @param {string} id a media id we want to check
 * @returns {boolean} true if given id is a transient media id, false otherwise
 */
function isTransientMediaId( id ) {
	return typeof id === 'string' && startsWith( id, 'media-' );
}

export default isTransientMediaId;
