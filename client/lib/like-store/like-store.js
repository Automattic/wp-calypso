/** @format */
/**
 * External dependencies
 */
import { assign, clone, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import Emitter from 'lib/mixins/emitter';
import { fetchLikes } from 'lib/like-store/actions';
import { key } from './utils';

var _likesForPost = {},
	LikeStore,
	receivedErrors = [];

function getLikes( siteId, postId ) {
	return _likesForPost[ key( siteId, postId ) ];
}

function setLikes( siteId, postId, likes ) {
	_likesForPost[ key( siteId, postId ) ] = likes;
}

LikeStore = {
	/**
	 * Get a list of people who have liked a post (currently limited to 90 people by endpoint)
	 *
	 * @returns {object} A map with one property, likes, which contains an array of users
	 *
	 * @param {int} Site ID
	 * @param {int} Post ID
	 */
	getLikersForPost: function( siteId, postId ) {
		var likes = getLikes( siteId, postId );

		// Do we have likes for this post already?
		if ( likes && likes.likes ) {
			return likes.likes;
		}

		fetchLikes( siteId, postId );

		return null;
	},

	/**
	 * Get a count of likes for a post
	 *
	 * @returns {int} Object with count or indicator that fetching is happening
	 *
	 * @param {int} Site ID
	 * @param {int} Post ID
	 */
	getLikeCountForPost: function( siteId, postId ) {
		var likes = getLikes( siteId, postId );

		// Do we have likes for this post already?
		if ( likes && likes.count != null ) {
			return likes.count;
		}

		fetchLikes( siteId, postId );

		return null;
	},

	/**
	 * Check if a post is liked by the current user
	 *
	 * @returns {boolean}
	 *
	 * @param {int} Site ID
	 * @param {int} Post ID
	 */
	isPostLikedByCurrentUser: function( siteId, postId ) {
		var likes = getLikes( siteId, postId );

		// Do we have likes for this post already?
		if ( likes && likes.i_like != null ) {
			return likes.i_like;
		}

		fetchLikes( siteId, postId );

		return null;
	},

	receivePostLikes: function( action ) {
		if ( ! action || action.error ) {
			if ( action.error ) {
				receivedErrors.push( action );
			}
			return;
		}

		if ( ! action.siteId || ! action.postId ) {
			return;
		}

		var currentLike = getLikes( action.siteId, action.postId );

		// adapt response to our format
		var receivedLike = {
			count: action.data.found,
			likes: action.data.likes,
			i_like: action.data.i_like,
		};

		if ( ! isEqual( receivedLike, currentLike ) ) {
			setLikes( action.siteId, action.postId, receivedLike );
			LikeStore.emit( 'change' );
		}
	},

	receiveUserLikeChange: function( action ) {
		if ( ! action || action.error ) {
			if ( action.error ) {
				receivedErrors.push( action );
			}
			return;
		}

		this.receivePost( action.siteId, action.postId, action.data );
	},

	receivePost: function( siteId, postId, post ) {
		if ( ! siteId || ! postId || ! post || post.is_external ) {
			return;
		}

		var currentLike = getLikes( siteId, postId ) || {};

		if ( currentLike.count !== post.like_count || currentLike.i_like !== post.i_like ) {
			setLikes( siteId, postId, {
				count: post.like_count,
				likes: currentLike.likes,
				i_like: !! post.i_like,
			} );
			LikeStore.emit( 'change' );
		}
	},

	receiveLike: function( action ) {
		var current = getLikes( action.siteId, action.postId ),
			newLikes = clone( current );

		newLikes.count += 1;
		newLikes.i_like = true;

		setLikes( action.siteId, action.postId, newLikes );

		LikeStore.emit( 'change' );
	},

	receiveUnlike: function( action ) {
		var current = getLikes( action.siteId, action.postId ),
			newLikes = clone( current );

		newLikes.count -= 1;
		newLikes.i_like = false;

		setLikes( action.siteId, action.postId, newLikes );

		LikeStore.emit( 'change' );
	},
};

if ( process.env.NODE_ENV === 'test' ) {
	assign( LikeStore, {
		// These bedlumps are for testing.
		// Ideally, we'd pull these out with envify for prod
		_all: function() {
			return _likesForPost;
		},
		_reset: function() {
			_likesForPost = {};
		},
	} );
}

Emitter( LikeStore );

// Increase the max number of listeners from 10 to 100
LikeStore.setMaxListeners( 100 );

LikeStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'LIKE_POST':
			LikeStore.receiveLike( action );
			break;

		case 'UNLIKE_POST':
			LikeStore.receiveUnlike( action );
			break;

		case 'RECEIVE_POST_LIKES':
			LikeStore.receivePostLikes( action );
			break;

		case 'RECEIVE_LIKE_RESPONSE':
		case 'RECEIVE_UNLIKE_RESPONSE':
			LikeStore.receiveUserLikeChange( action );
			break;
	}
} );

export default LikeStore;
