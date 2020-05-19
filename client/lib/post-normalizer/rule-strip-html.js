/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { stripHTML } from 'lib/formatting';

export default function stripHtml( post ) {
	forEach( [ 'excerpt', 'title', 'site_name' ], function ( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = stripHTML( post[ prop ] );
		}
	} );

	if ( post.author && post.author.name ) {
		post.author.name = stripHTML( post.author.name );
	}
	return post;
}
