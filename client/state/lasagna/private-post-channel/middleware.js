/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { LASAGNA_SOCKET_CONNECTED, ROUTE_SET } from 'state/action-types';
import { READER_POST_SEEN } from 'state/reader/action-types';
import { getReaderFullViewPostKey } from 'state/reader/full-view/selectors/get-reader-full-view-post-key';
import { getPostByKey } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';
import registerEventHandlers from './events-to-actions';
import { socket } from '../socket';

let channel = null;

const channelTopicPrefix = 'private:push:wp_post:';
const debug = debugFactory( 'lasagna:channel:private:push:wp_post' );

const joinChannel = ( store, site, post, postKey ) => {
	if ( ! socket || ! site.is_private ) {
		return;
	}

	channel = socket.channel( channelTopicPrefix + post.global_ID,  );

	await lasagna.initChannel(
		topic,
		{ post_key: postKey },
		{
			onClose: () => debug( 'channel closed' ),
			onError: ( reason ) => debug( 'channel error', reason ),
		}
	);

	lasagna.registerEventHandler( topic, 'new_comment', ( { payload: comment } ) => {
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

	lasagna.joinChannel( topic, () => debug( 'channel join ok' ) );
};

const leaveChannel = ( topic ) => lasagna.leaveChannel( topic );

export default ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			const state = store.getState();
			const postKey = getReaderFullViewPostKey( state );
			const post = getPostByKey( state, postKey );

			if ( ! post ) {
				break;
			}

			const site = getSite( state, post.site_ID );

			if ( ! site ) {
				break;
			}

			joinChannel( store, site, post, postKey );
			break;
		}

		case READER_POST_SEEN: {
			const postKey = getReaderFullViewPostKey( store.getState() );
			joinChannel( store, action.payload.site, action.payload.post, postKey );
			break;
		}

		case ROUTE_SET:
			leaveChannel();
			break;
	}

	return next( action );
};
