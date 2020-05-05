/**
 * External dependencies
 */

import { maxBy, values } from 'lodash';

/**
 * Internal Dependencies
 */

export default function pickPrimaryTag( post ) {
	// if we hand max an invalid or empty array, it returns -Infinity
	const primary_tag = maxBy( values( post.tags ), function ( tag ) {
		return tag.post_count;
	} );

	if ( primary_tag !== undefined ) {
		post.primary_tag = primary_tag;
	}

	return post;
}
