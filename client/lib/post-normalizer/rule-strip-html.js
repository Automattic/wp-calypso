import { stripHTML } from 'calypso/lib/formatting';

export default function stripHtml( post ) {
	[ 'excerpt', 'title', 'site_name' ].forEach( function ( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = stripHTML( post[ prop ] );
		}
	} );

	if ( post.author && post.author.name ) {
		post.author.name = stripHTML( post.author.name );
	}
	return post;
}
