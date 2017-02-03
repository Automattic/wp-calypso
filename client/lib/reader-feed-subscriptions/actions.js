/**
 * External Dependencies
 */
import { get } from 'lodash';
import Dispatcher from 'dispatcher';

/**
 * Internal Dependencies
 */
import wpcom from 'lib/wp';
import { action as ActionTypes } from './constants';
import { prepareSiteUrl } from './helper';
import { isRequestInflight, requestTracker } from 'lib/inflight';
import FeedSubscriptionStore from './index';
import { action as SiteStoreActionTypes } from 'lib/reader-site-store/constants';
import { action as FeedStoreActionTypes } from 'lib/feed-store/constants';

const FeedSubscriptionActions = {
	follow: function( url, fetchMeta = true ) {
		let meta;

		if ( ! url ) {
			return;
		}

		const preparedUrl = prepareSiteUrl( url );

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

		const preparedUrl = prepareSiteUrl( url );

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
		let requestKey = 'following_mine';

		if ( ! params ) {
			params = getNextPageParams();
		}

		// Append selected params to the request key
		requestKey = requestKey + '_page' + params.page;

		// Do we already have a request in motion?
		if ( isRequestInflight( requestKey ) ) {
			return;
		}

		const callback = requestTracker( requestKey, function( error, data ) {
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
		if ( isRequestInflight( processKey ) ) {
			return;
		}
		const onDone = requestTracker( processKey, function() {} );
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
	* @param {Function} cb callback to invoke when complete
	**/
	fetchNextPage: function( cb ) {
		if ( FeedSubscriptionStore.isLastPage() ) {
			return;
		}

		Dispatcher.handleViewAction( { type: ActionTypes.FETCH_NEXT_FEED_SUBSCRIPTIONS_PAGE } );

		const params = getNextPageParams();

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

		const sites = [], feeds = [];
		data.subscriptions.forEach( function( sub ) {
			const site = get( sub, 'meta.data.site' ),
				feed = get( sub, 'meta.data.feed' );
			if ( site ) {
				sites.push( site );
			}
			if ( feed ) {
				feeds.push( feed );
			}
		} );

		if ( sites.length > 0 ) {
			Dispatcher.handleServerAction( {
				type: SiteStoreActionTypes.RECEIVE_BULK_UPDATE,
				data: sites
			} );
		}

		if ( feeds.length > 0 ) {
			Dispatcher.handleServerAction( {
				type: FeedStoreActionTypes.RECEIVE_BULK_UPDATE,
				data: feeds
			} );
		}
	},
};

function getNextPageParams() {
	const params = {
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
