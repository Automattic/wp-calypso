/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { LASAGNA_SOCKET_CONNECTED, ROUTE_SET } from 'state/action-types';
import { READER_POST_SEEN } from 'state/reader/action-types';
import { getPostByKey } from 'state/reader/posts/selectors';
import { getReaderFullViewPostKey } from 'state/reader/full-view/selectors/get-reader-full-view-post-key';
import { getSite } from 'state/reader/sites/selectors';
import { receiveComments } from 'state/comments/actions';
import { lasagna } from '../middleware';

const channelTopicPrefix = 'push:no_auth:wordpress.com:wp_post:';
const debug = debugFactory( 'lasagna:channel:push:no_auth:wp_post' );

const joinChannel = async ( store, topic ) => {
	await lasagna.initChannel(
		topic,
		{},
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

const getTopic = ( store ) => {
	const state = store.getState();
	const postKey = getReaderFullViewPostKey( state );
	const post = getPostByKey( state, postKey );

	if ( ! post ) {
		return false;
	}

	const site = getSite( state, post.site_ID );

	if ( ! site ) {
		return false;
	}

	return channelTopicPrefix + post.global_ID;
};

/**
 * Middleware
 */
export default ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			const topic = getTopic( store );

			if ( topic ) {
				joinChannel( store, topic );
			}
			break;
		}

		case READER_POST_SEEN:
			joinChannel( store, channelTopicPrefix + action.payload.post.global_ID );
			break;

		case ROUTE_SET: {
			const topic = getTopic( store );

			if ( topic ) {
				leaveChannel( topic );
			}
			break;
		}
	}

	return next( action );
};
