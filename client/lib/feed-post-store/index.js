/** @format */
/**
 * External dependencies
 */
import { get, forEach, isEqual, defer } from 'lodash';
import debugModule from 'debug';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';
import { runFastRules, runSlowRules } from 'state/reader/posts/normalization-rules';
import { action as FeedPostActionType } from './constants';
import { action as FeedStreamActionType } from 'lib/feed-stream-store/constants';
import { mc } from 'lib/analytics';
import { pageViewForPost } from 'reader/stats';
import { updateConversationFollowStatus } from 'state/reader/conversations/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import { CONVERSATION_FOLLOW_STATUS } from 'state/reader/conversations/follow-status';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { READER_POSTS_RECEIVE } from 'state/action-types';
import { getPostByKey, getPostById } from 'state/reader/posts/selectors';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:feed-post-store' );

const FeedPostStore = {};

emitter( FeedPostStore );

FeedPostStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload && payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case FeedPostActionType.FETCH_FEED_POST:
			receivePending( action );
			break;

		case FeedStreamActionType.RECEIVE_PAGE:
		case FeedStreamActionType.RECEIVE_UPDATES:
		case FeedStreamActionType.RECEIVE_GAP:
			if ( ! action.error && action.data.posts ) {
				forEach( action.data.posts, receivePostFromPage );
			}
			break;

		case FeedPostActionType.RECEIVE_FEED_POST:
			if ( action.error ) {
				const error = {
					status_code: action.error.statusCode ? action.error.statusCode : -1,
					errorCode: '-',
					message: action.error.toString(),
				};
				if ( action.blogId ) {
					receiveBlogError( action.blogId, action.postId, error );
				} else {
					receiveError( action.feedId, action.postId, error );
				}
			} else if ( action.blogId ) {
				receiveBlogPost( action.blogId, action.postId, action.data );
			} else {
				receivePost( action.feedId, action.postId, action.data );
			}
			break;

		case FeedPostActionType.MARK_FEED_POST_SEEN:
			markPostSeen( action.data.post, action.data.site );
			break;
	}
} );

FeedPostStore.setMaxListeners( 100 );

const isValidPost = post => post && post.global_ID;

function setPost( post ) {
	if ( ! isValidPost( post ) ) {
		return false;
	}

	const cachedPost = getPostById( reduxGetState(), post.global_ID );

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return false;
	}

	reduxDispatch( { type: READER_POSTS_RECEIVE, posts: [ post ] } );

	// Send conversation follow status over to Redux
	if ( post.hasOwnProperty( 'is_following_conversation' ) ) {
		const followStatus = post.is_following_conversation
			? CONVERSATION_FOLLOW_STATUS.following
			: CONVERSATION_FOLLOW_STATUS.not_following;
		reduxDispatch(
			bypassDataLayer(
				updateConversationFollowStatus( {
					siteId: post.site_ID,
					postId: post.ID,
					followStatus,
				} )
			)
		);
	}
}

function receivePending( action ) {
	const currentPost = getPostByKey( reduxGetState(), action );
	const post = !! action.feedId
		? { ID: action.postId, feed_ID: action.feedId }
		: { ID: action.postId, site_ID: action.siteId };

	setPost( { ...post, ...currentPost, state: 'pending' } );
}

function receivePostFromPage( newPost ) {
	if ( ! isValidPost( newPost ) ) {
		return;
	}

	if ( ! getPostById( reduxGetState(), newPost.global_ID ) ) {
		setPost( { ...newPost, _state: 'minimal' } );
	}
}

function receivePost( feedId, postId, post ) {
	if ( ! post ) {
		return;
	}

	if ( post.errors || post.status_code === 404 ) {
		receiveError( feedId, postId, post );
	} else {
		normalizePost( feedId, postId, post );
	}
}

function receiveBlogPost( blogId, postId, post ) {
	if ( ! post ) {
		return;
	}

	if ( post.errors || post.status_code === 404 ) {
		post.site_ID = blogId;
		post.ID = postId;
		post.is_external = false;
		receiveError( null, null, post );
	} else {
		normalizePost( null, null, post );
	}
}

function receiveError( feedId, postId, error ) {
	let statusCode, errorCode, message;
	if ( error.status_code ) {
		statusCode = error.status_code;

		if ( error.errors ) {
			errorCode = error.errors.error;
			message = error.errors.message;
		}
	} else {
		// find the key in the Error
		errorCode = Object.keys( error.errors )[ 0 ];
		if ( errorCode ) {
			statusCode = error.error_data[ errorCode ];
			message = error.errors[ errorCode ][ 0 ];
		}
	}

	setPost( {
		global_ID: uuid(),
		feed_ID: feedId,
		feed_item_ID: postId,
		site_ID: error.site_ID,
		ID: error.ID,
		date: error.date,
		_state: 'error',
		message: message,
		errorCode: errorCode,
		statusCode: statusCode,
	} );
}

function receiveBlogError( blogId, postId, error ) {
	error.site_ID = blogId;
	error.ID = postId;
	error.is_external = false;
	receiveError( null, null, error );
}

function normalizePost( feedId, postId, post ) {
	if ( ! post ) {
		debug( 'post is required' );
		return;
	}

	const normalizedPost = runFastRules( post );
	setPost( normalizedPost );

	defer( function() {
		runSlowRules( normalizedPost ).then( setPost );
	} );
}

function markPostSeen( post, site ) {
	if ( ! post ) {
		return;
	}

	const originalPost = post;

	if ( ! post._seen ) {
		post = Object.assign( {}, post, { _seen: true } );
	}

	if ( post.site_ID ) {
		// they have a site ID, let's try to push a page view
		const isAdmin = !! get( site, 'capabilities.manage_options', false );
		if ( site && site.ID ) {
			if ( site.is_private || ! isAdmin ) {
				pageViewForPost( site.ID, site.URL, post.ID, site.is_private );
				mc.bumpStat( 'reader_pageviews', site.is_private ? 'private_view' : 'public_view' );
			}
		}
	}

	if ( originalPost !== post ) {
		setPost( post );
	}
}

export default FeedPostStore;
