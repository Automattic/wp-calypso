// External dependencies
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

// Internal dependencies
import { requestInflight, requestTracker } from 'lib/inflight';
import { action } from './constants';
import ReaderListsTagsStore from 'lib/reader-lists-tags/store';

const TAGS_PER_PAGE = 10;

export function fetchMoreTags( listOwner, listSlug, page ) {
	if ( requestInflight( action.ACTION_RECEIVE_READER_LIST_TAGS ) ) {
		return;
	}

	ReaderListsTagsStore.setIsFetching( true );

	const args = {
		owner: listOwner,
		slug: listSlug,
		page: page,
		number: TAGS_PER_PAGE
	};

	wpcom.undocumented().readListTags( args, requestTracker( action.ACTION_RECEIVE_READER_LIST_TAGS, function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_TAGS_ERROR,
				data: data,
				error: error
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: action.ACTION_RECEIVE_READER_LIST_TAGS,
				data: data
			} );
		}
		ReaderListsTagsStore.setIsFetching( false );
	} ) );
}
