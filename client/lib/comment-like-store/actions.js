/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:comment-like-store:actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

function getQuery() {
	// Attribute likes to reader in stats
	return { source: 'reader' };
}

var CommentLikeActions = {

	/**
	* Like a comment as the current user
	*
	* @param {int} siteId Site ID
	* @param {int} commentId Comment ID
	*/
	likeComment: function( siteId, commentId ) {
		Dispatcher.handleViewAction( {
			type: 'LIKE_COMMENT',
			siteId: siteId,
			commentId: commentId
		} );

		wpcom.site( siteId ).comment( commentId ).like().add( getQuery(), function( error, data ) {
			CommentLikeActions.receiveLikeResponse( error, siteId, commentId, data );
		} );
	},

	/**
	 * Unlike a comment as the current user
	 *
	 * @param {int} siteId Site ID
	 * @param {int} commentId Comment ID
	 */
	unlikeComment: function( siteId, commentId ) {
		Dispatcher.handleViewAction( {
			type: 'UNLIKE_COMMENT',
			siteId: siteId,
			commentId: commentId
		} );

		wpcom.site( siteId ).comment( commentId ).like().del( getQuery(), function( error, data ) {
			CommentLikeActions.receiveUnlikeResponse( error, siteId, commentId, data );
		} );
	},

	receiveLikeResponse: function( error, siteId, commentId, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_LIKE_RESPONSE',
			error: error,
			siteId: siteId,
			commentId: commentId,
			data: data
		} );
	},

	receiveUnlikeResponse: function( error, siteId, commentId, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_UNLIKE_RESPONSE',
			error: error,
			siteId: siteId,
			commentId: commentId,
			data: data
		} );
	}
};

module.exports = CommentLikeActions;
