/**
 * External Dependencies
 */
var assign = require( 'lodash/object/assign' ),
	config = require( 'config' ),
	debug = require( 'debug' )( 'calypso:feed-post-store' ),
	forEach = require( 'lodash/collection/forEach' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	forOwn = require( 'lodash/object/forOwn' ),
	clone = require( 'lodash/lang/clone' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	normalizer = require( 'lib/post-normalizer' ),
	normalizationRules = require( './normalization-rules' ),
	FeedPostActionType = require( './constants' ).action,
	FeedStreamActionType = require( 'lib/feed-stream-store/constants' ).action,
	ReaderSiteBlockActionType = require( 'lib/reader-site-blocks/constants' ).action;

var _posts = {},
	_postsForBlogs = {},
	FeedPostStore;

function blogKey( postKey ) {
	return postKey.blogId + '-' + postKey.postId;
}

FeedPostStore = {
	get: function( postKey ) {
		if ( ! postKey ) {
			return;
		}

		if ( postKey.blogId ) {
			return _postsForBlogs[ blogKey( postKey ) ];
		} else if ( postKey.feedId && postKey.postId ) {
			return _posts[ postKey.postId ];
		}
	}
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
		}
	} );
}

emitter( FeedPostStore );

FeedPostStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload && payload.action,
		error;

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
				error = {
					status_code: -1,
					errorCode: '-',
					message: action.error.toString()
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

		case ReaderSiteBlockActionType.BLOCK_SITE:
			markBlockedSitePosts( action.siteId, true );
			break;
		case ReaderSiteBlockActionType.RECEIVE_BLOCK_SITE:
			markBlockedSitePosts( action.siteId, action.data && action.data.success );
			break;
		case ReaderSiteBlockActionType.UNBLOCK_SITE:
			markBlockedSitePosts( action.siteId, false );
			break;
		case ReaderSiteBlockActionType.RECEIVE_UNBLOCK_SITE:
			markBlockedSitePosts( action.siteId, ! ( action.data && action.data.success ) );
			break;
	}
} );

function _setFeedPost( id, post ) {
	var cachedPost;
	if ( ! id ) {
		return false;
	}

	cachedPost = _posts[ id ];

	post.feed_item_ID = id;

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return false;
	}

	_posts[ id ] = post;
	return true;
}

function _setBlogPost( post ) {
	var key, cachedPost;
	if ( ! post || ! post.site_ID || post.is_external ) {
		return false;
	}

	key = blogKey( {
		blogId: post.site_ID,
		postId: post.ID
	} );
	cachedPost = _postsForBlogs[ key ];

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return false;
	}

	_postsForBlogs[ key ] = post;
	return true;
}

function setPost( id, post ) {
	var changedFeed = _setFeedPost( id, post ),
		changedBlog = _setBlogPost( post ),
		changed = changedFeed || changedBlog;
	if ( changed ) {
		FeedPostStore.emit( 'change' );
	}
}

function receivePending( action ) {
	var post, currentPost;
	if ( action.blogId ) {
		post = {
			site_ID: action.blogId,
			ID: action.postId
		};
		currentPost = _postsForBlogs[ blogKey( action.blogId, action.postId ) ];
		post = assign( post, currentPost, { _state: 'pending' } );
		setPost( null, post );
	} else {
		post = {
			feed_ID: action.feedId,
			feed_item_ID: action.postId
		};
		currentPost = _posts[ action.postId ];
		post = assign( post, currentPost, { _state: 'pending' } );
		setPost( action.postId, post );
	}
}

function receivePostFromPage( newPost ) {
	if ( ! ( newPost && newPost.ID ) ) {
		return;
	}

	if ( newPost.feed_ID && newPost.ID && ! _posts[ newPost.ID ] ) {
		// 1.3 style
		setPost( newPost.ID, assign( {}, newPost, { _state: 'minimal' } ) );
	} else if ( newPost.site_ID && ! _postsForBlogs[ blogKey( {
				blogId: newPost.site_ID,
				postId: newPost.ID
			} ) ] ) {
		setPost( null, assign( {}, newPost, { _state: 'minimal' } ) );
	}
}

function receivePost( feedId, postId, post ) {
	if ( post.errors ) {
		receiveError( feedId, postId, post );
	} else {
		normalizePost( feedId, postId, post );
	}
}

function receiveBlogPost( blogId, postId, post ) {
	if ( post.errors ) {
		post.site_ID = blogId;
		post.ID = postId;
		post.is_external = false;
		receiveError( null, null, post );
	} else {
		normalizePost( null, null, post );
	}
}

function receiveError( feedId, postId, error ) {
	var statusCode, errorCode, message;
	if ( error.status_code ) {
		statusCode = error.status_code;
		errorCode = error.errors.error;
		message = error.errors.message;
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
		statusCode: statusCode
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

	normalizer( post, normalizationRules.fastRules, function( err, normalizedPost ) {
		if ( ! err ) {
			setPost( postId, normalizedPost );

			process.nextTick( function() {
				normalizer( normalizedPost, normalizationRules.slowRules, function( fullErr, fullyNormalizedPost ) {
					if ( ! fullErr ) {
						setPost( postId, fullyNormalizedPost );
					}
				} );
			} );
		}
	} );
}

function markBlockedSitePosts( siteId, isSiteBlocked ) {
	forOwn( _postsForBlogs, function( post ) {
		var newPost;
		if ( post.site_ID === siteId && post.is_site_blocked !== isSiteBlocked ) {
			newPost = clone( post );
			newPost.is_site_blocked = isSiteBlocked;
			setPost( newPost.feed_item_ID, newPost );
		}
	} );
}

module.exports = FeedPostStore;
