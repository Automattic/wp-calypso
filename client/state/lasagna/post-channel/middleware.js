/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import {
	READER_VIEWING_FULL_POST_SET,
	READER_VIEWING_FULL_POST_UNSET,
} from 'state/reader/action-types';
import { getPostByKey } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';
import { receiveComments } from 'state/comments/actions';
import { lasagna } from '../middleware';

const privateTopicScheme = 'push';
const publicTopicScheme = 'push:no_auth';
const topicNs = 'wordpress.com:wp_post';
const debug = debugFactory( 'lasagna:channel' );

const joinChannel = async ( store, topic ) => {
	await lasagna.initChannel(
		topic,
		{},
		{
			onClose: () => debug( topic + ' channel closed' ),
			onError: ( reason ) => debug( topic + ' channel error', reason ),
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

	lasagna.joinChannel( topic, () => debug( topic + ' channel join ok' ) );
};

const leaveChannel = ( topic ) => lasagna.leaveChannel( topic );

const getTopic = ( store, postKey ) => {
	const state = store.getState();
	const post = getPostByKey( state, postKey );

	if ( ! post ) {
		return false;
	}

	const site = getSite( state, post.site_ID );

	if ( ! site ) {
		return false;
	}

	const scheme = site.is_private ? privateTopicScheme : publicTopicScheme;

	return [ scheme, topicNs, post.global_ID ].join( ':' );
};

/**
 * Middleware
 *
 * @param store middleware store
 */
export default ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case READER_VIEWING_FULL_POST_SET: {
			const topic = getTopic( store, action.postKey );

			if ( topic ) {
				joinChannel( store, topic );
			}
			break;
		}

		case READER_VIEWING_FULL_POST_UNSET: {
			const topic = getTopic( store, action.postKey );
			if ( topic ) {
				leaveChannel( topic );
			}
			break;
		}
	}

	return next( action );
};
