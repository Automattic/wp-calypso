import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

import { requestInflight, requestTracker } from 'lib/inflight';
import { ACTION_RECEIVE_READER_LIST_TAGS, ACTION_RECEIVE_READER_LIST_TAGS_ERROR } from './constants';

export function fetchMoreTags( listOwner, listSlug ) {
	if ( requestInflight( ACTION_RECEIVE_READER_LIST_TAGS ) ) {
		return;
	}

	const args = {
		owner: listOwner,
		slug: listSlug
	};

	wpcom.undocumented().readListTags( args, requestTracker( ACTION_RECEIVE_READER_LIST_TAGS, function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ACTION_RECEIVE_READER_LIST_TAGS_ERROR,
				data: data,
				error: error
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ACTION_RECEIVE_READER_LIST_TAGS,
				data: data
			} );
		}
	} ) );
}
