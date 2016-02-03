/**
 * External Dependencies
 */
import chai, { expect } from 'chai';
import Dispatcher from 'dispatcher';
import Immutable from 'immutable';
import chaiImmutable from 'chai-Immutable';

chai.use( chaiImmutable );

var debug = require( 'debug' )( 'calypso:bananas' );

const FeedSubscriptionStore = require( '../index' );

describe( 'feed-subscription-store', function() {
	beforeEach( function() {
		Dispatcher.handleViewAction( {
			type: 'RESET_FEED_SUBSCRIPTIONS_STATE',
		} );
	} );

	it( 'should have a dispatch token', function() {
		expect( FeedSubscriptionStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should follow a new feed by URL', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( 'URL', siteUrl ) ).to.equal( Immutable.fromJS(
			{
				URL: siteUrl,
				state: 'SUBSCRIBED'
			}
		) );
	} );

	it( 'should unfollow an existing feed', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( 'URL', siteUrl ) ).to.be.undefined;
	} );

	it( 'should add subscription details when a follow is confirmed', function() {
		const siteUrl = 'http://trailnose.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
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

		expect( FeedSubscriptionStore.getSubscription( 'URL', siteUrl ) ).to.equal( Immutable.fromJS( {
			URL: siteUrl,
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
			data: { URL: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', zeldmanSiteUrl ) ).to.eq( true );

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED_ERROR',
			url: zeldmanSiteUrl,
			data: null,
			error: new Error( 'There was a problem' )
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastError( 'URL', zeldmanSiteUrl ) ).to.be.an( 'object' );
		expect( FeedSubscriptionStore.getLastError( 'URL', 'blah' ) ).to.be.undefined;

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED_ERROR',
			url: zeldmanSiteUrl,
			data: {
				info: 'unable_to_follow',
				subscribed: false
			}
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastError( 'URL', zeldmanSiteUrl ).get( 'errorType' ) ).to.be.ok;
		expect( FeedSubscriptionStore.getLastError( 'URL', 'blah' ) ).to.be.undefined;
	} );

	it( 'should find a feed regardless of protocol used', function() {
		var zeldmanSiteUrl = 'http://www.zeldman.com';

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: { URL: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', 'https://www.zeldman.com' ) ).to.eq( true );
	} );

	it( 'should receive a list of subscriptions', function() {
		FeedSubscriptionStore.setPerPage( 2 );

		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 1, total_subscriptions: 505, subscriptions: [ { ID: 1, URL: 'http://www.banana.com', feed_ID: 123 }, { ID: 2, URL: 'http://www.feijoa.com' } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'URL', 'http://www.banana.com' ) ).to.equal( Immutable.fromJS( {
			ID: 1,
			URL: 'http://www.banana.com',
			feed_ID: 123,
			state: 'SUBSCRIBED'
		} ) );
		expect( FeedSubscriptionStore.getSubscriptionCount() ).to.eq( 505 );

		// Receiving second page (subscriptions should be merged)
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 2, total_subscriptions: 505, subscriptions: [ { ID: 3, URL: 'http://www.dragonfruit.com', feed_ID: 456 } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowing( 'URL', 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getIsFollowing( 'URL', 'https://www.dragonfruit.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'URL', 'http://www.dragonfruit.com' ) ).to.equal( Immutable.fromJS( {
			ID: 3,
			URL: 'http://www.dragonfruit.com',
			feed_ID: 456,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not add duplicate subscriptions', function() {
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_POST',
			data: { is_following: true, site_URL: 'http://www.tomato.com' },
			error: null
		} );
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_POST',
			data: { is_following: true, site_URL: 'http://www.tomato.com' },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.tomato.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().size ).to.eq( 1 );
	} );

	it( 'should update an existing subscription in the store on re-follow', function() {
		const siteUrl = 'http://www.rambutan.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
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
			data: { URL: siteUrl },
			error: null
		} );

		// Then re-follow...
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		// The subscription data from the first follow response should still exist
		// (and there should not be duplicate records for the same feed)
		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( siteUrl ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().size ).to.eq( 1 );
		expect( FeedSubscriptionStore.getSubscription( 'URL', siteUrl ).get( 'feed_ID' ) ).to.eq( 123 );
		expect( FeedSubscriptionStore.getSubscription( 'URL', siteUrl ).get( 'state' ) ).to.eq( 'SUBSCRIBED' );
	} );

	it( 'should update the total subscription count during follow and unfollow', function() {
		const siteUrl = 'http://www.mango.com';

		// Receive initial total_subscriptions count
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 1, total_subscriptions: 506, subscriptions: [ { ID: 345, URL: 'http://www.dragonfruit.com', feed_ID: 456 } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscriptionCount() ).to.eq( 506 );

		// Follow
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscriptionCount() ).to.eq( 507 );

		// Unfollow
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscriptionCount() ).to.eq( 506 );

		// Re-follow (to check that the state change UNSUBSCRIBED->SUBSCRIBED updates the count correctly)
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscriptionCount() ).to.eq( 507 );
	} );

	it( 'dismisses a error by site URL', function() {
		const zeldmanSiteUrl = 'http://www.zeldman.com';

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED_ERROR',
			url: zeldmanSiteUrl,
			data: {
				info: 'unable_to_follow',
				subscribed: false
			}
		} );

		expect( FeedSubscriptionStore.getLastError( 'URL', zeldmanSiteUrl ) ).to.be.an( 'object' );

		Dispatcher.handleViewAction( {
			type: 'DISMISS_FOLLOW_ERROR',
			URL: zeldmanSiteUrl
		} );

		expect( FeedSubscriptionStore.getLastError( 'URL', zeldmanSiteUrl ) ).to.be.an( 'undefined' );
	} );

	it.skip( 'should unfollow an existing feed by subscription ID', function() {
		const subId = 123;
		const siteUrl = 'http://www.trailnose.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { URL: siteUrl },
			error: null
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: siteUrl,
			data: {
				subscribed: true,
				subscription: {
					ID: subId,
					URL: siteUrl,
					feed_ID: 123
				}
			}
		} );

		debug( FeedSubscriptionStore.getSubscriptions() );
		expect( FeedSubscriptionStore.getSubscription( 'ID', subId ) ).to.be.an( 'object' );

		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			ID: subId,
			data: { ID: subId },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( 'ID', subId ) ).to.be.undefined;
	} );
} );
