/**
 * External Dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	Dispatcher = require( 'dispatcher' ),
	fromJS = require( 'immutable' ).fromJS;

const PostEmailSubscriptionStore = require( '../index' );

describe( 'store', function() {
	beforeEach( function() {
		PostEmailSubscriptionStore.clearSubscriptions();
	} );

	it( 'should have a dispatch token', function() {
		expect( PostEmailSubscriptionStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should create a new subscription', function() {
		const blogId = 123;

		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		expect( PostEmailSubscriptionStore.getSubscription( blogId ) ).to.immutablyEqual(
			fromJS( {
				blog_id: 123,
				delivery_frequency: 24,
				state: 'SUBSCRIBED'
			} )
		);
	} );

	it( 'should unsubscribe from an existing subscription', function() {
		const blogId = 123;

		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		Dispatcher.handleViewAction( {
			type: 'UNSUBSCRIBE_FROM_POST_EMAILS',
			blog_id: blogId
		} );

		expect( PostEmailSubscriptionStore.getSubscription( blogId ) ).to.be.undefined;
	} );

	it( 'should add subscription details when a subscribe is confirmed', function() {
		const blogId = 123;

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_SUBSCRIBE_TO_POST_EMAILS',
			data: {
				subscribed: true,
				subscription: {
					blog_id: blogId,
					delivery_frequency: 24,
					email_id: 123456
				}
			}
		} );

		expect( PostEmailSubscriptionStore.getSubscription( blogId ) ).to.immutablyEqual( fromJS( {
			blog_id: blogId,
			email_id: 123456,
			delivery_frequency: 24,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not store a subscribe if there is an API error', function() {
		const blogId = 456;

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_SUBSCRIBE_TO_POST_EMAILS',
			data: null,
			blog_id: blogId,
			error: new Error( 'There was a problem' )
		} );

		expect( PostEmailSubscriptionStore.getIsSubscribed( blogId ) ).to.eq( false );
		expect( PostEmailSubscriptionStore.getLastErrorByBlog( blogId ) ).to.be.an( 'object' );
	} );

	it( 'should update the delivery frequency of an existing subscription', function() {
		const blogId = 789;

		Dispatcher.handleViewAction( {
			type: 'UPDATE_POST_EMAIL_DELIVERY_FREQUENCY',
			blog_id: blogId,
			delivery_frequency: 168
		} );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UPDATE_POST_EMAIL_DELIVERY_FREQUENCY',
			blog_id: blogId,
			data: {
				success: true,
				subscribed: true
			}
		} );

		expect( PostEmailSubscriptionStore.getSubscription( blogId ) ).to.immutablyEqual(
			fromJS( {
				blog_id: 789,
				delivery_frequency: 168,
				state: 'SUBSCRIBED'
			} )
		);
	} );

	it( 'should revert the delivery frequency of an existing subscription when there is an API error', function() {
		const blogId = 910;

		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		Dispatcher.handleViewAction( {
			type: 'UPDATE_POST_EMAIL_DELIVERY_FREQUENCY',
			blog_id: blogId,
			delivery_frequency: 168
		} );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UPDATE_POST_EMAIL_DELIVERY_FREQUENCY',
			blog_id: blogId,
			data: {
				success: false,
				subscribed: false,
				subscription: { delivery_frequency: 24 }
			},
			error: new Error( 'There was a problem' )
		} );

		expect( PostEmailSubscriptionStore.getSubscription( blogId ).get( 'delivery_frequency' ) ).to.equal( 24 );
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
								post_delivery_frequency: 'daily',
								send_posts: true
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

		expect( PostEmailSubscriptionStore.getIsSubscribed( 123987 ) ).to.eq( true );
		expect( PostEmailSubscriptionStore.getSubscription( 123987 ).get( 'delivery_frequency' ) ).to.eq( 'daily' );
	} );

	it( 'should remove subscriptions when a feed is unfollowed', function() {
		const blogId = 2626;

		// Set up a subscription
		Dispatcher.handleViewAction( {
			type: 'SUBSCRIBE_TO_POST_EMAILS',
			blog_id: blogId,
			delivery_frequency: 24
		} );

		// Fire off the unfollow API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UNFOLLOW_READER_FEED',
			blogId: blogId
		} );

		expect( PostEmailSubscriptionStore.getIsSubscribed( blogId ) ).to.eq( false );
	} );
} );
