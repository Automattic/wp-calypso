// External Dependencies
var assign = require( 'lodash/assign' );

// Internal dependencies
var Dispatcher = require( 'dispatcher' ),
	ACTION = require( './constants' ).action,
	PostBatcher = require( './post-batch-fetcher' );

var feedPostBatcher, blogPostBatcher, FeedPostActions;

feedPostBatcher = new PostBatcher( {
	BATCH_SIZE: 7,
	apiVersion: '1.3',
	buildUrl: function( postKey ) {
		return '/read/feed/' + encodeURIComponent( postKey.feedId ) + '/posts/' + encodeURIComponent( postKey.postId );
	},
	resultKeyRegex: /\/read\/feed\/(\d+)\/posts\/(\d+)/,
	onFetch: function( postKey ) {
		Dispatcher.handleViewAction( {
			type: ACTION.FETCH_FEED_POST,
			feedId: postKey.feedId,
			postId: postKey.postId
		} );
	},
	onError: function( error, postKey ) {
		FeedPostActions.receivePost( error, null, {
			feedId: postKey.feedId,
			postId: postKey.postId
		} );
	},
	onPostReceived: function( feedId, postId, post ) {
		FeedPostActions.receivePost( null, post, {
			feedId: feedId,
			postId: postId
		} );
	}
} );

blogPostBatcher = new PostBatcher( {
	BATCH_SIZE: 7,
	apiVersion: '1.1',
	buildUrl: function( postKey ) {
		return '/read/sites/' + encodeURIComponent( postKey.blogId ) + '/posts/' + encodeURIComponent( postKey.postId );
	},
	resultKeyRegex: /\/read\/sites\/(\d+)\/posts\/(\d+)/,
	onFetch: function( postKey ) {
		Dispatcher.handleViewAction( {
			type: ACTION.FETCH_FEED_POST,
			blogId: postKey.blogId,
			postId: postKey.postId
		} );
	},
	onError: function( error, postKey ) {
		FeedPostActions.receivePost( error, null, {
			blogId: postKey.blogId,
			postId: postKey.postId
		} );
	},
	onPostReceived: function( blogId, postId, post ) {
		FeedPostActions.receivePost( null, post, {
			blogId: blogId,
			postId: postId
		} );
	}
} );

FeedPostActions = {

	fetchPost: function( postKey ) {
		var batcher = postKey.blogId ? blogPostBatcher : feedPostBatcher;
		batcher.add( postKey );
	},

	receivePost: function( error, data, postKey ) {
		var batcher = postKey.blogId ? blogPostBatcher : feedPostBatcher;
		if ( data ) {
			batcher.remove( postKey );
		}

		Dispatcher.handleServerAction( assign( {
			type: ACTION.RECEIVE_FEED_POST,
			data: data,
			error: error
		}, postKey ) );
	}

};

module.exports = FeedPostActions;
