/**
 * External Dependencies
 */
const chai = require( 'chai' ),
	expect = chai.expect,
	Dispatcher = require( 'dispatcher' ),
	immutable = require( 'immutable' );

const FeedActionTypes = require( 'lib/feed-store/constants' ).action,
	FeedSubscriptionStore = require( '../index' );

describe( 'store', function() {
	beforeEach( function() {
		FeedSubscriptionStore.clearSubscriptions();
	} );

	it( 'should have a dispatch token', function() {
		expect( FeedSubscriptionStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should follow a new feed', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.immutablyEqual( immutable.fromJS(
			{
				URL: siteUrl,
				comparableUrl: 'trailnose.com',
				state: 'SUBSCRIBED'
			}
		) );
	} );

	it( 'should unfollow an existing feed', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.be.undefined;
	} );

	it( 'should add subscription details when a follow is confirmed', function() {
		var siteUrl = 'http://trailnose.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: siteUrl,
			data: {
				subscribed: true,
				subscription: {
					URL: siteUrl,
					feed_ID: 123
				}
			}
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.immutablyEqual( immutable.fromJS( {
			URL: siteUrl,
			comparableUrl: 'trailnose.com',
			feed_ID: 123,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not store a follow if there is an API error', function() {
		var zeldmanSiteUrl = 'http://www.zeldman.com';

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: { url: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( true );

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: null,
			error: new Error( 'There was a problem' )
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( zeldmanSiteUrl ) ).to.be.an( 'object' );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( 'blah' ) ).to.be.undefined;

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: {
				info: 'unable_to_follow',
				subscribed: false
			}
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( zeldmanSiteUrl ).errorType ).to.be.ok;
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( 'blah' ) ).to.be.undefined;
	} );

	it( 'should find a feed regardless of protocol used', function() {
		var zeldmanSiteUrl = 'http://www.zeldman.com';

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: { url: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.zeldman.com' ) ).to.eq( true );
	} );

	it( 'should receive a list of subscriptions', function() {
		FeedSubscriptionStore.setPerPage( 2 );

		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 1, total_subscriptions: 505, subscriptions: [ { ID: 1, URL: 'http://www.banana.com', feed_ID: 123 }, { ID: 2, URL: 'http://www.feijoa.com' } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'http://www.banana.com' ) ).to.immutablyEqual( immutable.fromJS( {
			ID: 1,
			URL: 'http://www.banana.com',
			comparableUrl: 'www.banana.com',
			feed_ID: 123,
			state: 'SUBSCRIBED'
		} ) );
		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 505 );

		// Receiving second page (subscriptions should be merged)
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 2, total_subscriptions: 505, subscriptions: [ { ID: 3, URL: 'http://www.dragonfruit.com', feed_ID: 456 } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.dragonfruit.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'http://www.dragonfruit.com' ) ).to.immutablyEqual( immutable.fromJS( {
			ID: 3,
			URL: 'http://www.dragonfruit.com',
			comparableUrl: 'www.dragonfruit.com',
			feed_ID: 456,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not add duplicate subscriptions', function() {
		const siteUrl = 'http://www.tomato.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.tomato.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().count ).to.eq( 1 );
	} );

	it( 'should update an existing subscription in the store on re-follow', function() {
		const siteUrl = 'http://www.rambutan.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: siteUrl,
			data: {
				subscribed: true,
				subscription: {
					URL: siteUrl,
					feed_ID: 123
				}
			}
		} );

		// Then unfollow....
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// Then re-follow...
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The subscription data from the first follow response should still exist
		// (and there should not be duplicate records for the same feed)
		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( siteUrl ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().count ).to.eq( 1 );
		expect( FeedSubscriptionStore.getSubscription( siteUrl ).get( 'feed_ID' ) ).to.eq( 123 );
		expect( FeedSubscriptionStore.getSubscription( siteUrl ).get( 'state' ) ).to.eq( 'SUBSCRIBED' );
	} );

	it( 'should update the total subscription count during follow and unfollow', function() {
		const siteUrl = 'http://www.mango.com';

		// Follow
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 1 );

		// Unfollow
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 0 );

		// Re-follow (to check that the state change UNSUBSCRIBED->SUBSCRIBED updates the count correctly)
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 1 );
	} );

	it( 'should pick up a subscription from a feed result', () => {
		const feed_URL = 'http://example.com/atom';
		Dispatcher.handleServerAction( {
			type: FeedActionTypes.RECEIVE_FETCH,
			data: {
				feed_ID: 1,
				is_following: true,
				feed_URL
			}
		} );

		expect( FeedSubscriptionStore.getSubscription( feed_URL ).get( 'feed_ID' ) ).to.eql( 1 );
	} );

	it( 'should sort existing subscriptions into the correct place when accepting them', () => {
		// take a feed with no sub date
		Dispatcher.handleServerAction( {
			type: FeedActionTypes.RECEIVE_FETCH,
			data: {
				is_following: true,
				feed_URL: 'http://example.com/atom',
				feed_ID: 789
			}
		} );

		// take a set of subs that do have dates
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: {
				page: 1,
				total_subscriptions: 999,
				subscriptions: [
					{
						ID: 1,
						URL: 'http://www.dragonfruit.com',
						feed_ID: 123,
						date_subscribed: '2016-01-01T00:00:00Z'
					},
					{
						ID: 2,
						URL: 'http://example.com/atom',
						feed_ID: 789,
						date_subscribed: '2016-01-01T00:00:03Z'
					},
					{
						ID: 3,
						URL: 'http://www.dragonfruit3.com',
						feed_ID: 456,
						date_subscribed: '2016-01-01T00:00:03Z'
					}
				]
			}
		} );

		expect( FeedSubscriptionStore.getSubscriptions().count ).to.eql( 3 );
		expect( FeedSubscriptionStore.getSubscriptions().list.count() ).to.eql( 3 );
		expect( FeedSubscriptionStore.getSubscriptions().list.get( 1 ).get( 'feed_ID' ) ).to.eql( 456 );
	} );
} );
