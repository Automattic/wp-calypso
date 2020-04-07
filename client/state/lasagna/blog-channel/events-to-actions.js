/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	incrementCommentCount,
	receiveCommentCount,
	receiveComments,
} from 'state/comments/actions';
import { updateChannel } from 'state/lasagna/channel';
import { namespace } from './manager';
import { getPostTotalCommentsCount } from 'state/comments/selectors/get-post-total-comments-count';
import { getPostById } from 'state/reader/posts/selectors';

/**
 * Module variables
 */
const debug = debugFactory( 'lasagna:channel:public:push:blog' );

export default function( channel, topic, store ) {
	channel.on( 'new_comment', ( { payload: comment } ) => {
		debug( topic, 'new comment', comment );

		if ( ! comment ) {
			return;
		}

		const siteId = comment.post.site_ID;
		const postId = comment.post.ID;

		store.dispatch(
			receiveComments( {
				siteId,
				postId,
				comments: [ comment ],
				commentById: true,
			} )
		);

		// update comment counts
		const state = store.getState();
		const totalComments = getPostTotalCommentsCount( state, siteId, postId );
		if ( ! totalComments ) {
			const post = getPostById( state, comment.global_ID );
			store.dispatch(
				receiveCommentCount( { siteId, postId, totalCommentsCount: post.discussion.comment_count } )
			);
		}

		store.dispatch( incrementCommentCount( { siteId, postId } ) );

		// update channel
		updateChannel( { namespace, topic } );
	} );
}
