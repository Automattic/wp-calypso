// External dependencies
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

// Internal dependencies
import { requestInflight, requestTracker } from 'lib/inflight';
import { action } from './constants';

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
		}

		Dispatcher.handleViewAction( { type: action.ACTION_FETCH_READER_LIST_ITEMS_COMPLETE } );
	} ) );
}
