/**
 * External Dependencies
 */

import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';

/**
 * Internal Dependencies
 */

import { decodeEntities as decode } from 'lib/formatting';
import safeImageURL from 'lib/safe-image-url';

export default function decodeEntities( post ) {
	forEach( [ 'excerpt', 'title', 'site_name' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = decode( post[ prop ] );
		}
	} );

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
		forOwn( post.tags, function( tag ) {
			tag.name = decode( tag.name );
		} );
	}

	return post;
}
