// External Dependencies
const assign = require( 'lodash/assign' ),
	defer = require( 'lodash/defer' );

// Internal dependencies
const Dispatcher = require( 'dispatcher' ),
	ACTION = require( './constants' ).action,
	PostFetcher = require( './post-fetcher' ),
	wpcom = require( 'lib/wp' );

let feedPostFetcher, blogPostFetcher, FeedPostActions;

feedPostFetcher = new PostFetcher( {
	makeRequest: function( postKey ) {
		return wpcom.undocumented().readFeedPost( postKey );
	},
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

blogPostFetcher = new PostFetcher( {
	makeRequest: function( postKey ) {
		return wpcom.undocumented().readSitePost( { site: postKey.blogId, postId: postKey.postId } );
	},
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
		const fetcher = postKey.blogId ? blogPostFetcher : feedPostFetcher;
		fetcher.add( postKey );
	},

	receivePost: function( error, data, postKey ) {
		const fetcher = postKey.blogId ? blogPostFetcher : feedPostFetcher;
		if ( data ) {
			fetcher.remove( postKey );
		}

		Dispatcher.handleServerAction( assign( {
			type: ACTION.RECEIVE_FEED_POST,
			data: data,
			error: error
		}, postKey ) );
	},

	markSeen: function( post, source ) {
		defer( function() {
			Dispatcher.handleViewAction( {
				type: ACTION.MARK_FEED_POST_SEEN,
				data: {
					post, source
				}
			} );
		} );
	}
};

module.exports = FeedPostActions;
