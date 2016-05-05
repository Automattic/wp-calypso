/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:comment-store:actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	key = require( './utils' ).key,
	wpcom = require( 'lib/wp' ),
	ActionTypes = require( './constants' ).action;

var inflight = {},
	commentPlaceholderCount = 0;

function requestInflight( requestKey ) {
	return requestKey in inflight;
}

function requestTracker( requestKey, callback ) {
	inflight[ requestKey ] = true;
	return function( error, data ) {
		delete inflight[ requestKey ];
		callback( error, data );
	};
}

function generateCommentPlaceholderId() {
	var commentPlaceholderId = 'pending' + commentPlaceholderCount;
	commentPlaceholderCount++;
	return commentPlaceholderId;
}

var CommentActions = {

	add: function( siteId, postId, commentText ) {
		if ( ! commentText ) {
			return;
		}

		// Generate a temporary ID for the the pending comment so we can update the right one later
		var commentPlaceholderId = generateCommentPlaceholderId();

		Dispatcher.handleViewAction( {
			type: ActionTypes.ADD_COMMENT,
			args: {
				siteId: siteId,
				postId: postId,
				parentCommentId: 0,
				commentText: commentText,
				commentPlaceholderId: commentPlaceholderId
			}
		} );

		wpcom.site( siteId ).post( postId ).comment().add( commentText, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_ADD_COMMENT,
				args: {
					siteId: siteId,
					postId: postId,
					commentPlaceholderId: commentPlaceholderId
				},
				data: data,
				error: error
			} );
		} );
	},

	reply: function( siteId, postId, parentCommentId, commentText ) {
		if ( ! commentText ) {
			return;
		}

		// Generate a temporary ID for the the pending comment so we can update the right one later
		var commentPlaceholderId = generateCommentPlaceholderId();

		Dispatcher.handleViewAction( {
			type: ActionTypes.REPLY_TO_COMMENT,
			args: {
				siteId: siteId,
				postId: postId,
				parentCommentId: parentCommentId,
				commentText: commentText,
				commentPlaceholderId: commentPlaceholderId
			}
		} );

		wpcom.site( siteId ).post( postId ).comment( parentCommentId ).reply( commentText, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_REPLY_TO_COMMENT,
				args: {
					siteId: siteId,
					postId: postId,
					parentCommentId: parentCommentId,
					commentPlaceholderId: commentPlaceholderId
				},
				data: data,
				error: error
			} );
		} );
	},

	/**
	* Fetch a post's list of comments
	*
	* @param {int} Site ID
	* @param {int} Post ID
	*/
	fetch: function( siteId, postId ) {
		if ( requestInflight( key( siteId, postId ) ) ) {
			return;
		}

		var requestKey = key( siteId, postId ),
			callback = requestTracker( requestKey, function( error, data ) {
				CommentActions.receivePostComments( error, siteId, postId, data );
			} );

		var query = {
			hierarchical: true,
			type: 'comment'
		};

		wpcom.site( siteId ).post( postId ).comment().replies( query, callback );
	},

	receivePostComments: function( error, siteId, postId, data ) {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_POST_COMMENTS,
			error: error,
			siteId: siteId,
			postId: postId,
			data: data
		} );
	},

};

module.exports = CommentActions;
