// External dependencies
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import get from 'lodash/get';

// Internal dependencies
import { requestInflight, requestTracker } from 'lib/inflight';
import { action } from './constants';
import { action as siteStoreActionTypes } from 'lib/reader-site-store/constants';
import { action as feedStoreActionTypes } from 'lib/feed-store/constants';

const PER_PAGE = 50;

export function fetchMoreItems( listOwner, listSlug, page ) {
	if ( requestInflight( action.ACTION_RECEIVE_READER_LIST_ITEMS ) ) {
		return;
	}

	Dispatcher.handleViewAction( { type: action.ACTION_FETCH_READER_LIST_ITEMS } );

	const args = {
		owner: listOwner,
		slug: listSlug,
		page: page,
		number: PER_PAGE,
		item_types: 'feed,site',
		meta: 'feed,site'
	};

	wpcom.undocumented().readListItems( args, requestTracker( action.ACTION_RECEIVE_READER_LIST_ITEMS, function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_ITEMS_ERROR,
				data: data,
				error: error
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_ITEMS,
				data: data
			} );

			// If we received site or feed meta, fire off an action
			if ( data && data.items && Array.isArray( data.items ) ) {
				data.items.forEach( function( item ) {
					receiveMeta( item );
				} );
			}
		}

		Dispatcher.handleViewAction( { type: action.ACTION_FETCH_READER_LIST_ITEMS_COMPLETE } );
	} ) );
}

function receiveMeta( item ) {
	if ( get( item, 'meta.data.site' ) ) {
		Dispatcher.handleServerAction( {
			type: siteStoreActionTypes.RECEIVE_FETCH,
			siteId: item.meta.data.site.ID,
			data: item.meta.data.site
		} );
	}

	if ( get( item, 'meta.data.feed' ) ) {
		Dispatcher.handleServerAction( {
			type: feedStoreActionTypes.RECEIVE_FETCH,
			feedId: item.meta.data.feed.feed_ID,
			data: item.meta.data.feed
		} );
	}
}
