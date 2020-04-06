/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { incrementCommentCount, receiveComments } from 'state/comments/actions';
import { updateChannel } from 'state/lasagna/socket';
import { namespace } from './manager';

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

		store.dispatch(
			receiveComments( {
				siteId: comment.post.site_ID,
				postId: comment.post.ID,
				comments: [ comment ],
				commentById: true,
			} )
		);

		store.dispatch( incrementCommentCount( comment.post.site_ID, comment.post.ID ) );

		// update channel
		updateChannel( { namespace, topic } );
	} );
}
