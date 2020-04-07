/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { incrementCommentCount, receiveComments } from 'state/comments/actions';
import { updateChannel } from 'state/lasagna/channel';
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

		store.dispatch( incrementCommentCount( { siteId, postId } ) );

		// update channel
		updateChannel( { namespace, topic } );
	} );
}
