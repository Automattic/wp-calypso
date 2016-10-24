/**
 * External Dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	Dispatcher = require( 'dispatcher' ),
	fromJS = require( 'immutable' ).fromJS;

const CommentEmailSubscriptionStore = require( '../index' );

describe( 'store', function() {
	beforeEach( function() {
		CommentEmailSubscriptionStore.clearSubscriptions();
	} );

	it( 'should have a dispatch token', function() {
		expect( CommentEmailSubscriptionStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should create a new subscription', function() {
		const blogId = 123;

		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_COMMENT_EMAILS',
			blog_id: blogId
		} );

		expect( CommentEmailSubscriptionStore.getSubscription( blogId ) ).to.immutablyEqual(
			fromJS( {
				blog_id: 123,
				state: 'SUBSCRIBED'
			} )
		);
	} );

	it( 'should unsubscribe from an existing subscription', function() {
		const blogId = 123;

		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_COMMENT_EMAILS',
			blog_id: blogId
		} );

		Dispatcher.handleViewAction( {
			type: 'UNSUBSCRIBE_FROM_COMMENT_EMAILS',
			blog_id: blogId
		} );

		expect( CommentEmailSubscriptionStore.getSubscription( blogId ) ).to.be.a( 'undefined' );
	} );

	it( 'should not store a subscribe if there is an API error', function() {
		const blogId = 456;

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_COMMENT_EMAILS',
			blog_id: blogId
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_SUBSCRIBE_TO_COMMENT_EMAILS',
			data: null,
			blog_id: blogId,
			error: new Error( 'There was a problem' )
		} );

		expect( CommentEmailSubscriptionStore.getIsSubscribed( blogId ) ).to.eq( false );
		expect( CommentEmailSubscriptionStore.getLastErrorByBlog( blogId ) ).to.be.an( 'object' );
	} );

	it( 'should pick up email subscriptions from feed subscription data', function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: {
				page: 1,
				total_subscriptions: 505,
				subscriptions: [
					{
						ID: 1,
						URL: 'http://www.banana.com',
						blog_ID: 123987,
						delivery_methods: {
							email: {
								send_posts: false,
								send_comments: true
							}
						}
					},
					{
						ID: 2,
						URL: 'http://www.feijoa.com'
					}
				]
			},
			error: null
		} );

		expect( CommentEmailSubscriptionStore.getIsSubscribed( 123987 ) ).to.eq( true );
	} );

	it( 'should remove subscriptions when a feed is unfollowed', function() {
		const blogId = 2626;

		// Set up a subscription
		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_COMMENT_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		// Fire off the unfollow API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UNFOLLOW_READER_FEED',
			blogId: blogId
		} );

		expect( CommentEmailSubscriptionStore.getIsSubscribed( blogId ) ).to.eq( false );
	} );
} );
