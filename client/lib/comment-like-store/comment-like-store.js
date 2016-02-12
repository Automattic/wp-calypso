// External dependencies
var assign = require( 'lodash/assign' ),
	clone = require( 'lodash/clone' ),
	config = require( 'config' ),
	forEach = require( 'lodash/forEach' );

// Internal dependencies
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	key = require( './utils' ).key,
	CommentStoreActionTypes = require( 'lib/comment-store/constants' ).action,
	ActionTypes = require( './constants' ).action;

var CommentLikeStore,
	_likesForComment = {},
	_receivedErrors = {};


function getLikes( siteId, commentId ) {
	return _likesForComment[ key( siteId, commentId ) ];
}

function setLikes( siteId, commentId, likes ) {
	_likesForComment[ key( siteId, commentId ) ] = likes;
}

function recordError( siteId, error ) {
	_receivedErrors[ siteId ] = error;
}

CommentLikeStore = {

	/**
	 * Get a count of likes for a comment
	 *
	 * @returns {int} Object with count or indicator that fetching is happening
	 *
	 * @param {int} Site ID
	 * @param {int} Comment ID
	 */
	getLikeCountForComment: function( siteId, commentId ) {
		var likes = getLikes( siteId, commentId );

		// Do we have likes for this comment already?
		if ( likes && likes.count != null ) {
			return likes.count;
		}

		return null;
	},

	/**
	 * Check if a post is liked by the current user
	 *
	 * @returns {boolean}
	 *
	 * @param {int} Site ID
	 * @param {int} Comment ID
	 */
	isCommentLikedByCurrentUser: function( siteId, commentId ) {
		var likes = getLikes( siteId, commentId );

		// Do we have likes for this comment already?
		if ( likes && likes.i_like != null ) {
			return likes.i_like;
		}

		return null;
	},

	/**
	 * Receive a new like
	 *
	 * @param {int} Site ID
	 * @param {int} Comment ID
	 */
	receiveLike: function( siteId, commentId ) {
		var current = getLikes( siteId, commentId ),
			newLikes = clone( current );

		if ( ! newLikes ) {
			newLikes = { count: 0, i_like: false };
		}

		newLikes.count += 1;
		newLikes.i_like = true;

		setLikes( siteId, commentId, newLikes );

		CommentLikeStore.emit( 'change' );
	},

	/**
	 * Receive a new unlike
	 *
	 * @param {int} Site ID
	 * @param {int} Comment ID
	 */
	receiveUnlike: function( siteId, commentId) {
		var current = getLikes( siteId, commentId ),
			newLikes = clone( current );

		if ( ! newLikes ) {
			newLikes = { count: 0, i_like: false };
		} else {
			newLikes.count -= 1;
			newLikes.i_like = false;
		}

		setLikes( siteId, commentId, newLikes );

		CommentLikeStore.emit( 'change' );
	},

	/**
	 * Receive a new like response from the API
	 *
	 * @param {obj} Payload action
	 */
	receiveLikeResponse: function( action ) {
		if ( action && ! action.error && action.data.success ) {
			return;
		}

		recordError( action.siteId, action );

		// Revert the optimistic like
		this.receiveUnlike( action.siteId, action.commentId );
	},

	/**
	 * Receive a new unlike response from the API
	 *
	 * @param {obj} Payload action
	 */
	receiveUnlikeResponse: function( action ) {
		if ( action && ! action.error && action.data.success ) {
			return;
		}

		recordError( action.siteId, action );

		// Revert the optimistic unlike
		this.receiveLike( action.siteId, action.commentId );
	},

	/**
	 * Receive post comments from the API
	 *
	 * @param {object} Payload action
	 */
	receivePostComments: function( action ) {
		if ( ! action || action.error ) {
			if ( action.error ) {
				recordError( action.siteId, action );
			}
			return;
		}

		if ( ! action.siteId || ! action.data.comments ) {
			return;
		}

		forEach( action.data.comments, function( comment ) {
			var current = getLikes( action.siteId, comment.ID ),
				newLikes = clone( current );

			newLikes = { count: comment.like_count , i_like: comment.i_like };
			setLikes( action.siteId, comment.ID, newLikes );
		} );

		CommentLikeStore.emit( 'change' );
	},
};

if ( config( 'env' ) === 'development' ) {
	assign( CommentLikeStore, {
		// These bedlumps are for testing.
		_reset: function() {
			_likesForComment = {};
		}
	} );
}

Emitter( CommentLikeStore );

// Increase the max number of listeners from 10 to 100
CommentLikeStore.setMaxListeners( 100 );

CommentLikeStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case ActionTypes.LIKE_COMMENT:
			CommentLikeStore.receiveLike( action.siteId, action.commentId );
			break;

		case ActionTypes.UNLIKE_COMMENT:
			CommentLikeStore.receiveUnlike( action.siteId, action.commentId );
			break;

		case CommentStoreActionTypes.RECEIVE_POST_COMMENTS:
			CommentLikeStore.receivePostComments( action );
			break;

		case ActionTypes.RECEIVE_COMMENT_LIKE_RESPONSE:
			CommentLikeStore.receiveLikeResponse( action );
			break;

		case ActionTypes.RECEIVE_COMMENT_UNLIKE_RESPONSE:
			CommentLikeStore.receiveUnlikeResponse( action );
			break;
	}
} );

module.exports = CommentLikeStore;
