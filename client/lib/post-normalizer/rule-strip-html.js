/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';

/**
 * Internal Dependencies
 */
import formatting from 'lib/formatting';

export default function stripHtml( post ) {
	forEach( [ 'excerpt', 'title', 'site_name' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = formatting.stripHTML( post[ prop ] );
		}
	} );

	if ( post.author && post.author.name ) {
		post.author.name = formatting.stripHTML( post.author.name );
	}
	return post;
}
