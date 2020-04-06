/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { incrementCommentCount, receiveComments } from 'state/comments/actions';

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

		store.dispatch( incrementCommentCount( comment.post.site_ID, comment.post.ID ) );
	} );
}
