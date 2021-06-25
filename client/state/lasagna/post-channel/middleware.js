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
} from 'calypso/state/reader/action-types';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { receiveComments } from 'calypso/state/comments/actions';
import { lasagna } from '../middleware';

const debug = debugFactory( 'lasagna:channel' );
const topicPrivateScheme = 'push';
const topicPublicScheme = 'push-no_auth';
const topicIss = 'wordpress.com';
const topicSubPrefix = 'wp_post';

const getTopic = ( { scheme, post } ) => {
	const postIdSiteIdKey = `${ post.ID }-${ post.site_ID }`;
	return [ scheme, topicIss, topicSubPrefix, postIdSiteIdKey ].join( ':' );
};

const getJoinParams = ( store, postKey ) => {
	const state = store.getState();
	const post = getPostByKey( state, postKey );

	if ( ! post ) {
		return false;
	}

	const site = getSite( state, post.site_ID );

	if ( ! site ) {
		return false;
	}

	const scheme = site.is_private ? topicPrivateScheme : topicPublicScheme;

	return { scheme, post };
};

const joinChannel = async ( store, joinParams ) => {
	const topic = getTopic( joinParams );

	await lasagna.initChannel(
		topic,
		{ content_type: topicSubPrefix, post_id: joinParams.post.ID, site_id: joinParams.post.site_ID },
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

/**
 * Middleware
 *
 * @param store middleware store
 */
export default ( store ) => ( next ) => ( action ) => {
	const mwResult = next( action );

	switch ( action.type ) {
		case READER_VIEWING_FULL_POST_SET: {
			const joinParams = getJoinParams( store, action.postKey );
			if ( ! joinParams ) {
				return false;
			}

			joinChannel( store, joinParams );
			break;
		}

		case READER_VIEWING_FULL_POST_UNSET: {
			const joinParams = getJoinParams( store, action.postKey );
			if ( ! joinParams ) {
				return false;
			}

			const topic = getTopic( joinParams );
			if ( ! topic ) {
				return false;
			}

			leaveChannel( topic );
			break;
		}
	}

	return mwResult;
};
