// External Dependencies
var forEach = require( 'lodash/forEach' ),
	get = require( 'lodash/get' );

// Internal dependencies
var Dispatcher = require( 'dispatcher' ),
	ActionType = require( './constants' ).action,
	FeedPostStoreActions = require( 'lib/feed-post-store/actions' ),
	feedPostListCache = require( './feed-stream-cache' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	FeedStreamActions;

function getNextPageParams( store ) {
	var params = {
			orderBy: store.orderBy,
			number: store.perPage,
			meta: 'post,discover_original_post'
		},
		lastDate = store.getLastItemWithDate();

	if ( lastDate ) {
		params.before = lastDate;
	} else {
		// only fetch four items for the initial page
		// speeds up the initial fetch a fair bit
		params.number = 4;
		if ( store.startDate ) {
			params.before = store.startDate;
		}
	}

	return params;
}

FeedStreamActions = {

	fetchNextPage: function( id ) {
		var store = feedPostListCache.get( id ),
			params;

		if ( ! store || store.isLastPage() || store.isFetchingNextPage() || store.hasRecentError() ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionType.FETCH_NEXT_PAGE,
			id: id
		} );

		params = getNextPageParams( store );

		store.onNextPageFetch( params );

		store.fetcher( params, FeedStreamActions.receivePage.bind( FeedStreamActions, store.id ) );
	},

	receivePage: function( id, error, data ) {
		// Process metadata. Yes, this is weird.
		// The idea here is that we're getting posts back as metadata, so we should process them the same way we would have
		// if they came back via the standard post::fetch action. Rather than trying to make the post store deal with any
		// action type that _might_ have meta, we teach the stores that know they're using meta how to forward it on.
		//
		// This also lets other stores that are interested in posts pick them up. Handling it internally to the post store
		// would rob them of that chance.
		//
		// TODO add a new action that receives an array of posts, so we can batch up this change and only emit once
		if ( ! error && data && data.posts ) {
			forEach( data.posts, function( post ) {
				if ( post && get( post, 'meta.data.discover_original_post' ) ) {
					// Looks like the original post for a Discover post (meta=discover_original_post)
					FeedPostStoreActions.receivePost( null, post.meta.data.discover_original_post, {
						blogId: post.meta.data.discover_original_post.site_ID,
						postId: post.meta.data.discover_original_post.ID
					} );
				}

				if ( get( post, 'meta.data.site' ) ) {
					SiteStoreActions.receiveFetch( post.site_ID, null, post.meta.data.site );
				}

				if ( post && get( post, 'meta.data.post' ) ) {
					FeedPostStoreActions.receivePost( null, post.meta.data.post, {
						feedId: post.feed_ID,
						postId: post.ID
					} );
				} else if ( post && post.feed_ID && post.feed_item_ID ) {
					// 1.2 style
					FeedPostStoreActions.receivePost( null, post, {
						feedId: post.feed_ID,
						postId: post.feed_item_ID
					} );
				} else if ( post && post.site_ID ) {
					// this looks like a full post object
					FeedPostStoreActions.receivePost( null, post, {
						blogId: post.site_ID,
						postId: post.ID
					} );
				}
			} );
		}

		Dispatcher.handleServerAction( {
			type: ActionType.RECEIVE_PAGE,
			id: id,
			error: error,
			data: data
		} );
	},

	receiveUpdates: function( id, error, data ) {
		Dispatcher.handleServerAction( {
			type: ActionType.RECEIVE_UPDATES,
			id: id,
			error: error,
			data: data
		} );
	},

	showUpdates: function( id ) {
		Dispatcher.handleViewAction( {
			type: ActionType.SHOW_UPDATES,
			id: id
		} );
	},

	selectNextItem: function( id, selectedIndex ) {
		Dispatcher.handleViewAction( {
			type: ActionType.SELECT_NEXT_ITEM,
			id: id,
			selectedIndex: selectedIndex
		} );
	},

	selectPrevItem: function( id, selectedIndex ) {
		Dispatcher.handleViewAction( {
			type: ActionType.SELECT_PREV_ITEM,
			id: id,
			selectedIndex: selectedIndex
		} );
	},

	selectItem: function( id, selectedIndex ) {
		Dispatcher.handleViewAction( {
			type: ActionType.SELECT_ITEM,
			id: id,
			selectedIndex: selectedIndex
		} );
	},

	fillGap: function( id, gap ) {
		var store = feedPostListCache.get( id ),
			params;
		if ( ! store ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionType.FILL_GAP,
			id: id,
			gap: gap
		} );

		params = {
			before: gap.to.toISOString(),
			after: gap.from.toISOString(),
			number: store.gapFillCount,
			orderBy: store.orderBy
		};

		store.onGapFetch( params );

		store.fetcher( params, FeedStreamActions.receiveGap.bind( FeedStreamActions, store.id, gap ) );
	},

	receiveGap: function( id, gap, error, data ) {
		Dispatcher.handleServerAction( {
			type: ActionType.RECEIVE_GAP,
			id: id,
			gap: gap,
			error: error,
			data: data
		} );
	}
};

module.exports = FeedStreamActions;
