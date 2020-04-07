/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { receiveComments } from 'state/comments/actions';

const debug = debugFactory( 'lasagna:channel:public:push:wp_post' );

export default function( channel, store ) {
	channel.on( 'new_comment', ( { payload: comment } ) => {
		debug( 'New comment', comment );

		if ( ! comment ) {
			return;
		}

		store.dispatch(
			receiveComments( {
				siteId: comment.post.site_ID,
				postId: comment.post.ID,
				comments: [ comment ],
				commentById: true,
			} )
		);
	} );
}
