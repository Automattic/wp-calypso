/**
 * External dependencies
 */

import { forOwn } from 'lodash';

/**
 * Internal Dependencies
 */

import { decodeEntities as decode } from 'lib/formatting';
import safeImageURL from 'lib/safe-image-url';

const DEFAULT_FIELDS = [ 'excerpt', 'title', 'site_name' ];

export default function decodeEntities( post, fields = DEFAULT_FIELDS ) {
	fields.forEach( function ( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = decode( post[ prop ] );
		}
	} );

	// Sometimes titles are double-encoded, so run again to be sure
	post.title = decode( post.title );

	if ( post.parent && post.parent.title ) {
		post.parent.title = decode( post.parent.title );
	}

	if ( post.author ) {
		if ( post.author.name ) {
			post.author.name = decode( post.author.name );
		}
		if ( post.author.avatar_URL ) {
			post.author.avatar_URL = safeImageURL( post.author.avatar_URL );
		}
	}

	if ( post.tags ) {
		// tags is an object
		forOwn( post.tags, function ( tag ) {
			tag.name = decode( tag.name );
		} );
	}

	return post;
}
