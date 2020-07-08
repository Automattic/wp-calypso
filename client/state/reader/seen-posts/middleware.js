/**
 * Internal dependencies
 */
import {
	READER_SEEN_MARK_ALL_AS_SEEN_FEED_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_SECTION_REQUEST,
	READER_SEEN_MARK_AS_SEEN_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_REQUEST,
} from 'state/reader/action-types';
import {
	receiveMarkAllAsSeenSection,
	receiveMarkAllAsSeenFeed,
	receiveMarkAsSeen,
	receiveMarkAsUnseen,
} from 'state/reader/seen-posts/actions';
import { getStream } from 'state/reader/streams/selectors';
import { getPostsByKeys } from 'state/reader/posts/selectors';
import {
	persistMarkAllAsSeen,
	persistMarkAsSeen,
	persistMarkAsUnseen,
} from 'reader/lib/seen-posts';
import { getCurrentUserId } from 'state/current-user/selectors';

export default ( { getState, dispatch } ) => ( next ) => async ( action ) => {
	switch ( action.type ) {
		case READER_SEEN_MARK_AS_SEEN_REQUEST: {
			// load the tracking pixel that would persist the seen entry
			const currentUserId = getCurrentUserId( getState() );
			persistMarkAsSeen( {
				userId: currentUserId,
				feedId: action.feedId,
				feedItemIds: action.feedItemIds,
			} );

			// optimistically update the client with the posts seen state
			const { feedId, feedUrl, globalIds } = action;
			dispatch(
				receiveMarkAsSeen( {
					feedId,
					feedUrl,
					globalIds,
				} )
			);
			break;
		}

		case READER_SEEN_MARK_AS_UNSEEN_REQUEST: {
			// load the tracking pixel that would persist the removal of the seen entry
			const currentUserId = getCurrentUserId( getState() );
			persistMarkAsUnseen( {
				userId: currentUserId,
				feedId: action.feedId,
				feedItemIds: action.feedItemIds,
			} );

			// optimistically update the client with the posts seen state
			const { feedId, feedUrl, globalIds } = action;
			dispatch(
				receiveMarkAsUnseen( {
					feedId,
					feedUrl,
					globalIds,
				} )
			);
			break;
		}

		case READER_SEEN_MARK_ALL_AS_SEEN_FEED_REQUEST: {
			// load the tracking pixel that would persist the removal of the seen entry
			const currentUserId = getCurrentUserId( getState() );
			const { feedId, feedUrl, identifier } = action;

			persistMarkAllAsSeen( {
				userId: currentUserId,
				feedIds: [ feedId ],
			} );

			// get stream post identifier
			const state = getState();
			const stream = getStream( state, identifier );

			if ( ! stream.items ) {
				return;
			}
			const posts = getPostsByKeys( state, stream.items );

			// get their global ids
			const globalIds = posts.reduce( ( acc, item ) => {
				acc.push( item.global_ID );
				return acc;
			}, [] );

			// update to seen based on global ids
			dispatch(
				receiveMarkAllAsSeenFeed( {
					feedId: feedId,
					feedUrl: feedUrl,
					globalIds,
				} )
			);
			break;
		}

		case READER_SEEN_MARK_ALL_AS_SEEN_SECTION_REQUEST: {
			// load the tracking pixel that would persist the removal of the seen entry
			const currentUserId = getCurrentUserId( getState() );
			const { feedIds, feedUrls } = action;
			persistMarkAllAsSeen( {
				userId: currentUserId,
				feedIds,
			} );
			// get stream post identifier
			const state = getState();
			const section = getStream( state, action.identifier );

			if ( ! section.items ) {
				return;
			}
			const posts = getPostsByKeys( state, section.items );

			// get their global ids
			const globalIds = posts.reduce( ( acc, item ) => {
				acc.push( item.global_ID );
				return acc;
			}, [] );

			// update to seen based on global ids
			dispatch(
				receiveMarkAllAsSeenSection( {
					feedIds,
					feedUrls,
					globalIds,
				} )
			);

			// update to seen based on global ids
			break;
		}
	}

	return next( action );
};
