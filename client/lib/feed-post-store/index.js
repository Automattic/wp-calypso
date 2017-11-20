/** @format */

/**
 * External dependencies
 */

import config from 'config';
import { get, assign, forEach, isEqual, defer } from 'lodash';
import debugModule from 'debug';

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
import {
	CONVERSATION_FOLLOW_STATUS_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
} from 'state/reader/conversations/follow-status';
import { reduxDispatch } from 'lib/redux-bridge';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:feed-post-store' );

let _posts = {},
	_postsForBlogs = {};

function blogKey( postKey ) {
	return postKey.blogId + '-' + postKey.postId;
}

const FeedPostStore = {
	get: function( postKey ) {
		if ( ! postKey ) {
			return;
		}

		if ( postKey.blogId ) {
			return _postsForBlogs[ blogKey( postKey ) ];
		} else if ( postKey.feedId && postKey.postId ) {
			return _posts[ postKey.postId ];
		}
	},
};

if ( config( 'env' ) === 'development' ) {
	assign( FeedPostStore, {
		// These bedlumps are for testing.
		// Ideally, we'd pull these out with envify for prod
		_all: function() {
			return _posts;
		},
		_reset: function() {
			_posts = {};
			_postsForBlogs = {};
		},
	} );
}

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

		case FeedPostActionType.RECEIVE_NORMALIZED_FEED_POST:
			setPost( action.data.feed_item_ID, action.data );
			break;

		case FeedPostActionType.MARK_FEED_POST_SEEN:
			markPostSeen( action.data.post, action.data.site );
			break;
	}
} );

FeedPostStore.setMaxListeners( 100 );

function _setFeedPost( id, post ) {
	if ( ! id ) {
		return false;
	}

	const cachedPost = _posts[ id ];

	post.feed_item_ID = id;

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return false;
	}

	_posts[ id ] = post;
	return true;
}

function _setBlogPost( post ) {
	if ( ! post || ! post.site_ID || post.is_external ) {
		return false;
	}

	const key = blogKey( {
		blogId: post.site_ID,
		postId: post.ID,
	} );

	const cachedPost = _postsForBlogs[ key ];

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return false;
	}

	_postsForBlogs[ key ] = post;

	// Send conversation follow status over to Redux
	if ( post.hasOwnProperty( 'is_following_conversation' ) ) {
		const followStatus = post.is_following_conversation
			? CONVERSATION_FOLLOW_STATUS_FOLLOWING
			: CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING;
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

	return true;
}

function setPost( id, post ) {
	const changedFeed = _setFeedPost( id, post ),
		changedBlog = _setBlogPost( post ),
		changed = changedFeed || changedBlog;
	if ( changed ) {
		FeedPostStore.emit( 'change' );
	}
}

function receivePending( action ) {
	if ( action.blogId ) {
		let post = {
			site_ID: action.blogId,
			ID: action.postId,
		};
		const currentPost =
			_postsForBlogs[
				blogKey( {
					blogId: action.blogId,
					postId: action.postId,
				} )
			];
		post = assign( post, currentPost, { _state: 'pending' } );
		setPost( null, post );
	} else {
		let post = {
			feed_ID: action.feedId,
			feed_item_ID: action.postId,
		};
		const currentPost = _posts[ action.postId ];
		post = assign( post, currentPost, { _state: 'pending' } );
		setPost( action.postId, post );
	}
}

function receivePostFromPage( newPost ) {
	if ( ! ( newPost && newPost.ID ) ) {
		return;
	}

	if ( newPost.feed_ID && ! newPost.site_ID && newPost.ID && ! _posts[ newPost.ID ] ) {
		// 1.3 style
		setPost( newPost.ID, assign( {}, newPost, { _state: 'minimal' } ) );
	} else if (
		newPost.site_ID &&
		! _postsForBlogs[
			blogKey( {
				blogId: newPost.site_ID,
				postId: newPost.ID,
			} )
		]
	) {
		setPost( null, assign( {}, newPost, { _state: 'minimal' } ) );
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

	setPost( postId, {
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
	setPost( postId, normalizedPost );

	defer( function() {
		runSlowRules( normalizedPost ).then( setPost.bind( null, postId ) );
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
		setPost( post.feed_item_ID, post );
	}
}

export default FeedPostStore;
