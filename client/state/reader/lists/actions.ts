import {
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import 'calypso/state/data-layer/wpcom/read/lists/items';
import 'calypso/state/reader/init';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

interface ReaderListAction {
	type: string;
	[ key: string ]: unknown;
}

export const receiveReaderRecommendedBlogsItems = ( listOwner: string, listItems: object ) => ( {
	type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	listOwner,
	listItems,
} );

export const handleRecommendedBlogsRequestFailure = ( listOwner: string, error: string ) => ( {
	type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
	listOwner,
	error,
} );

/**
 * Request user recommended blogs only if no request is already in progress.
 * This prevents duplicate requests for the same user.
 * @param {string} listOwner User login of list owner
 * @returns {Function} Thunk that checks state before dispatching
 */
export function requestUserRecommendedBlogs( listOwner: string ): unknown {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ): ReaderListAction | void => {
		const isRequesting = getState().reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];

		if ( ! isRequesting ) {
			dispatch( {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner,
			} );
		}
	};
}
