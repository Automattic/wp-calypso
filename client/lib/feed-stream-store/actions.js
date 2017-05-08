/**
 *  External Dependencies
 */
import { forEach, get } from 'lodash';

/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';
import { action as ActionType } from './constants';
import FeedPostStoreActions from 'lib/feed-post-store/actions';
import feedPostListCache from './feed-stream-cache';
import SiteStoreActions from 'lib/reader-site-store/actions';
import wpcom from 'lib/wp';

function getNextPageParams( store ) {
	const params = {
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

export function fetchNextPage( id ) {
	const store = feedPostListCache.get( id );

	if ( ! store || store.isLastPage() || store.isFetchingNextPage() || store.hasRecentError() ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionType.FETCH_NEXT_PAGE,
		id
	} );

	const params = getNextPageParams( store );

	store.onNextPageFetch( params );

	store.fetcher( params, receivePage.bind( null, store.id ) );
}

export function receivePage( id, error, data ) {
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
		id,
		error,
		data
	} );
}

export function receiveUpdates( id, error, data ) {
	Dispatcher.handleServerAction( {
		type: ActionType.RECEIVE_UPDATES,
		id,
		error,
		data
	} );
}

export function showUpdates( id ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SHOW_UPDATES,
		id
	} );
}

export function selectNextItem( id ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SELECT_NEXT_ITEM,
		id
	} );
}

export function selectPrevItem( id ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SELECT_PREV_ITEM,
		id
	} );
}

export function selectFirstItem( id ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SELECT_FIRST_ITEM,
		id
	} );
}

export function selectItem( id, postKey ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SELECT_ITEM,
		id,
		postKey
	} );
}

export function fillGap( id, gap ) {
	const store = feedPostListCache.get( id );
	if ( ! store ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionType.FILL_GAP,
		id,
		gap
	} );

	const params = {
		before: gap.to.toISOString(),
		after: gap.from.toISOString(),
		number: store.gapFillCount,
		orderBy: store.orderBy
	};

	store.onGapFetch( params );

	store.fetcher( params, receiveGap.bind( null, store.id, gap ) );
}

export function receiveGap( id, gap, error, data ) {
	Dispatcher.handleServerAction( {
		type: ActionType.RECEIVE_GAP,
		id,
		gap,
		error,
		data
	} );
}

export function dismissPost( id, post ) {
	Dispatcher.handleViewAction( {
		type: ActionType.DISMISS_FEED_STREAM_POST,
		postKey: {
			blogId: post.site_ID,
			postId: post.ID
		},
		id
	} );
	wpcom.undocumented().me().dismissSite( post.site_ID );
}

export function shufflePosts( id ) {
	Dispatcher.handleViewAction( {
		type: ActionType.SHUFFLE_POSTS,
		id
	} );
}
