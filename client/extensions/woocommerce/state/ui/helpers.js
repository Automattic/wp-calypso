/**
 * External dependencies
 */

import { isObject } from 'lodash';

/**
 * Returns an index object to be used for temporary IDs before saving edits to
 * the server.
 *
 * @param {Array} bucketEdits Array of creates or updates.
 * @returns {object} Index for the next entry.
 */
export function nextBucketIndex( bucketEdits ) {
	return {
		index: ( bucketEdits || [] ).length,
	};
}

/**
 * Returns which bucket should be used when saving edits for a particular object.
 * @param {object} object Data object such as product or variation.
 * @returns {string} 'updates' for existing objects, 'creates' for new objects.
 */
export function getBucket( object ) {
	return ( object && ! isObject( object.id ) && 'updates' ) || 'creates';
}
