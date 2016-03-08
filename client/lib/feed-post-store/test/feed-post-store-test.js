require( 'lib/react-test-env-setup' )();

/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect;

// Internal Deps
var	Dispatcher = require( 'dispatcher' ),
	FeedStreamActionType = require( 'lib/feed-stream-store/constants' ).action,
	FeedPostActionType = require( 'lib/feed-post-store/constants' ).action;

import { action as FeedSubscriptionActionType } from 'lib/reader-feed-subscriptions/constants';

var FeedPostStore = require( '../' );

describe( 'feed-post-store', function() {
	beforeEach( function() {
		FeedPostStore._reset();
	} );

	it( 'should have a dispatch token', function() {
		expect( FeedPostStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should save a post from a feed page', function() {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { feed_ID: 1, ID: 2 } ] },
			error: null
		} );

		expect( FeedPostStore.get( {
			feedId: 1,
			postId: 2
		} ) ).to.be.ok;
	} );

	it( 'should save a post from a blog page', function() {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { site_ID: 1, ID: 2 } ] },
			error: null
		} );

		expect( FeedPostStore.get( {
			blogId: 1,
			postId: 2
		} ) ).to.be.ok;
	} );

	it( 'should ignore a post from a page without the right ID', function() {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { junk: '' } ] },
			error: null
		} );

		expect( FeedPostStore._all() ).to.eql( {} );
	} );

	it( 'should ignore a post from a page with an error', function() {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { global_ID: 1 } ] },
			error: new Error()
		} );

		expect( FeedPostStore._all() ).to.be.empty;
	} );

	it( 'should normalize a received post', function() {
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: {
				feed_id: 1,
				feed_item_ID: 2,
				ID: 3, // notice this can and will be different for wpcom posts
				title: 'chris & ben'
			},
			feedId: 1,
			postId: 2,
			error: null
		} );

		expect( FeedPostStore.get( {
			feedId: 1,
			postId: 2
		} ) ).to.be.ok;
		// dependant on the widow rules to be present
		expect( FeedPostStore.get( {
			feedId: 1,
			postId: 2
		} ).title ).to.equal( 'chris & ben' );
	} );

	it( 'should index a post by the site_ID and ID if it is internal', function() {
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: {
				feed_id: 1,
				feed_item_ID: 2,
				ID: 3, // notice this can and will be different for wpcom posts
				site_ID: 4,
				title: 'a sample post'
			},
			feedId: 1,
			postId: 2,
			error: null
		} );

		expect( FeedPostStore.get( {
			feedId: 1,
			postId: 2
		} ) ).to.be.ok;
		expect( FeedPostStore.get( {
			blogId: 4,
			postId: 3
		} ) ).to.be.ok;
	} );

	it( 'should accept a post without a feed ID', function() {
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: {
				ID: 3, // notice this can and will be different for wpcom posts
				site_ID: 4,
				title: 'a sample post'
			},
			blogId: 4,
			postId: 3,
			error: null
		} );

		expect( FeedPostStore.get( {
			feedId: 1,
			postId: 2
		} ) ).to.be.undefined;
		expect( FeedPostStore.get( {
			blogId: 4,
			postId: 3
		} ) ).to.be.ok;
	} );

	it( 'should remove posts when a blog is unfollowed', function() {
		const blogId = 4;
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			blogId: blogId,
			postId: 3,
			data: {
				ID: 3, // notice this can and will be different for wpcom posts
				site_ID: 4,
				title: 'a sample post'
			},
			error: null
		} );

		expect( FeedPostStore.get( {
			blogId: blogId,
			postId: 3
		} ) ).to.be.ok;

		// Fire off the unfollow API response
		Dispatcher.handleServerAction( {
			type: FeedSubscriptionActionType.RECEIVE_UNFOLLOW_READER_FEED,
			blogId: blogId
		} );

		FeedPostStore.removePostsMarkedForRemoval();

		expect( FeedPostStore.get( {
			blogId: blogId,
			postId: 3
		} ) ).to.be.undefined;
	} );
} );
