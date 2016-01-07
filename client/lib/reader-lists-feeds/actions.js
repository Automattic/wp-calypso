// External dependencies
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

// Internal dependencies
import { requestInflight, requestTracker } from 'lib/inflight';
import { action } from './constants';

const PER_PAGE = 50;

export function fetchMoreFeeds( listOwner, listSlug, page ) {
	if ( requestInflight( action.ACTION_RECEIVE_READER_LIST_FEEDS ) ) {
		return;
	}

	Dispatcher.handleViewAction( { type: action.ACTION_FETCH_READER_LIST_TAGS } );

	const args = {
		owner: listOwner,
		slug: listSlug,
		page: page,
		number: PER_PAGE
	};

	wpcom.undocumented().readListFeeds( args, requestTracker( action.ACTION_RECEIVE_READER_LIST_FEEDS, function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_FEEDS_ERROR,
				data: data,
				error: error
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_FEEDS,
				data: data
			} );
		}

		Dispatcher.handleViewAction( { type: action.ACTION_FETCH_READER_LIST_FEEDS_COMPLETE } );
	} ) );
}
