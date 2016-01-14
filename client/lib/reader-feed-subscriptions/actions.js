//var debug = require( 'debug' )( 'calypso:feed-subscription-actions' );

// External dependencies
var get = require( 'lodash/object/get' );

// Internal dependencies
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	ActionTypes = require( './constants' ).action,
	FeedSubscriptionHelper = require( './helper' ),
	inflight = require( 'lib/inflight' ),
	FeedSubscriptionStore = require( './index' ),
	SiteStoreActionTypes = require( 'lib/reader-site-store/constants' ).action,
	FeedStoreActionTypes = require( 'lib/feed-store/constants' ).action;

var FeedSubscriptionActions = {
	follow: function( url, fetchMeta ) {
		var meta;

		if ( ! url ) {
			return;
		}

		const preparedUrl = FeedSubscriptionHelper.prepareSiteUrl( url );

		if ( fetchMeta ) {
			meta = 'feed,site';
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.FOLLOW_READER_FEED,
			url: url,
			data: { url: preparedUrl }
		} );

		wpcom.undocumented().followReaderFeed( { url: preparedUrl, meta: meta }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_FOLLOW_READER_FEED,
				url: preparedUrl,
				data: data,
				error: error
			} );

			receiveSubscriptionMeta( data );
		} );
	},

	unfollow: function( url, blogId ) {
		if ( ! url ) {
			return;
		}

		const preparedUrl = FeedSubscriptionHelper.prepareSiteUrl( url );

		Dispatcher.handleViewAction( {
			type: ActionTypes.UNFOLLOW_READER_FEED,
			url: url,
			data: { url: preparedUrl }
		} );

		wpcom.undocumented().unfollowReaderFeed( { url: preparedUrl }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_UNFOLLOW_READER_FEED,
				url: preparedUrl,
				blogId: blogId,
				data: data,
				error: error
			} );
		} );
	},

	unfollowBySubscriptionId: function( subId, blogId ) {
		if ( ! subId ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.UNFOLLOW_READER_FEED,
			subId: subId
		} );

		wpcom.undocumented().unfollowReaderFeed( { sub_id: subId }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_UNFOLLOW_READER_FEED,
				subId: subId,
				blogId: blogId,
				data: data,
				error: error
			} );
		} );
	},

	dismissError: function( error ) {
		if ( ! error ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.DISMISS_FOLLOW_ERROR,
			data: error
		} );
	},

	/**
	* Fetch a list of feeds followed by the current user
	*
	* @param {object} params - Request parameters
	* @param { Function } cb - Callback to invoke when the API comes back and the action has been dispatched
	*/
	fetch: function( params, cb ) {
		var requestKey = 'following_mine',
			callback;

		if ( ! params ) {
			params = getNextPageParams();
		}

		// Append selected params to the request key
		requestKey = requestKey + '_page' + params.page;

		// Do we already have a request in motion?
		if ( inflight.requestInflight( requestKey ) ) {
			return;
		}

		callback = inflight.requestTracker( requestKey, function( error, data ) {
			FeedSubscriptionStore.setIsFetching( false );
			FeedSubscriptionActions.receiveFollowingList( error, data );
			if ( cb ) {
				cb( error, data );
			}
		} );

		FeedSubscriptionStore.setIsFetching( true );
		wpcom.undocumented().readFollowingMine( params, callback );
	},

	fetchAll: function( ) {
		const processKey = 'following_mine_all';
		if ( inflight.requestInflight( processKey ) ) {
			return;
		}
		const onDone = inflight.requestTracker( processKey, function() {} );
		function _loop( err ) {
			if ( err || FeedSubscriptionStore.isLastPage() ) {
				onDone();
				return;
			}
			FeedSubscriptionActions.fetchNextPage( _loop );
		}

		_loop();
	},

	/**
	* Fetch next page of followed feeds via the REST API
	*
	* @param cb callback to invoke when complete
	**/
	fetchNextPage: function( cb ) {
		var params;

		if ( FeedSubscriptionStore.isLastPage() ) {
			return;
		}

		Dispatcher.handleViewAction( { type: ActionTypes.FETCH_NEXT_FEED_SUBSCRIPTIONS_PAGE } );

		params = getNextPageParams();

		FeedSubscriptionActions.fetch( params, cb );
	},

	receiveFollowingList: function( error, data ) {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_FEED_SUBSCRIPTIONS,
			error: error,
			data: data
		} );

		if ( ! data || ! data.subscriptions || ! data.subscriptions.length ) {
			return;
		}

		// If we received site or feed meta, fire off an action
		data.subscriptions.forEach( function( subscription ) {
			receiveSubscriptionMeta( subscription );
		} );
	},
};

function getNextPageParams() {
	var params = {
			number: FeedSubscriptionStore.getPerPage(),
			meta: 'feed,site'
		},
		currentPage = FeedSubscriptionStore.getCurrentPage();

	if ( currentPage ) {
		params.page = currentPage + 1;
	}

	return params;
}

function receiveSubscriptionMeta( subscription ) {
	if ( get( subscription, 'meta.data.site' ) ) {
		Dispatcher.handleServerAction( {
			type: SiteStoreActionTypes.RECEIVE_FETCH,
			siteId: subscription.meta.data.site.ID,
			data: subscription.meta.data.site
		} );
	}

	if ( get( subscription, 'meta.data.feed' ) ) {
		Dispatcher.handleServerAction( {
			type: FeedStoreActionTypes.RECEIVE_FETCH,
			feedId: subscription.meta.data.feed.feed_ID,
			data: subscription.meta.data.feed
		} );
	}
}

module.exports = FeedSubscriptionActions;
