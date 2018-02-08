/** @format */
/**
 * External dependencies
 */
import { assign, defer } from 'lodash';

// Internal dependencies
import Dispatcher from 'dispatcher';
import { action as ACTION } from './constants';
import PostFetcher from './post-fetcher';
import wpcom from 'lib/wp';

const feedPostFetcher = new PostFetcher( {
	makeRequest: function( postKey ) {
		return wpcom.undocumented().readFeedPost( postKey );
	},
	onFetch: function( postKey ) {
		Dispatcher.handleViewAction( {
			type: ACTION.FETCH_FEED_POST,
			feedId: postKey.feedId,
			postId: postKey.postId,
		} );
	},
	onError: function( error, postKey ) {
		receivePost( error, null, {
			feedId: postKey.feedId,
			postId: postKey.postId,
		} );
	},
	onPostReceived: function( feedId, postId, post ) {
		receivePost( null, post, {
			feedId: feedId,
			postId: postId,
		} );
	},
} );

const blogPostFetcher = new PostFetcher( {
	makeRequest: function( postKey ) {
		return wpcom.undocumented().readSitePost( { site: postKey.blogId, postId: postKey.postId } );
	},
	onFetch: function( postKey ) {
		Dispatcher.handleViewAction( {
			type: ACTION.FETCH_FEED_POST,
			blogId: postKey.blogId,
			postId: postKey.postId,
		} );
	},
	onError: function( error, postKey ) {
		receivePost( error, null, {
			blogId: postKey.blogId,
			postId: postKey.postId,
		} );
	},
	onPostReceived: function( blogId, postId, post ) {
		receivePost( null, post, {
			blogId: blogId,
			postId: postId,
		} );
	},
} );

export function fetchPost( postKey ) {
	const fetcher = postKey.blogId ? blogPostFetcher : feedPostFetcher;
	fetcher.add( postKey );
}

export function receivePost( error, data, postKey ) {
	const fetcher = postKey.blogId ? blogPostFetcher : feedPostFetcher;
	if ( data ) {
		fetcher.remove( postKey );
	}

	Dispatcher.handleServerAction(
		assign(
			{
				type: ACTION.RECEIVE_FEED_POST,
				data: data,
				error: error,
			},
			postKey
		)
	);
}

export function markSeen( post, site, source ) {
	defer( function() {
		Dispatcher.handleViewAction( {
			type: ACTION.MARK_FEED_POST_SEEN,
			data: {
				post,
				site,
				source,
			},
		} );
	} );
}
