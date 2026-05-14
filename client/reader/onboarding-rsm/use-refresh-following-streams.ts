import { useQueryClient } from '@tanstack/react-query';
import {
	READER_FOLLOWING_VIEW_PREFERENCE,
	DEFAULT_VIEW,
} from 'calypso/reader/following/view-preference';
import { useDispatch, useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import {
	clearStream,
	requestPage,
	requestPaginatedStream,
} from 'calypso/state/reader/streams/actions';

/**
 * Returns a callback that refreshes the reader following streams after the
 * user has followed new sites or tags during onboarding.
 *
 * - `requestFollows` always runs to sync the Redux follows slice (keeps the
 *   sidebar "Recent" site list up to date).
 * - Stream data is only refreshed when the user is currently on /reader,
 *   since `recent` re-fetches unconditionally on mount and `following` will
 *   be invisible if not on the page.
 * - Which stream is refreshed is determined by the `reader_following_view`
 *   preference ('stream' default or 'recent').
 */
export const useRefreshFollowingStreams = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const currentView = useSelector(
		( state ) => getPreference( state, READER_FOLLOWING_VIEW_PREFERENCE ) ?? DEFAULT_VIEW
	);

	return () => {
		// Always refresh the follows list so the sidebar site list is up to date.
		dispatch( requestFollows() );

		// Only refresh visible stream data if the user is on /reader.
		const isOnReaderFeed =
			window.location.pathname === '/reader' ||
			window.location.pathname.startsWith( '/reader/recent' );
		if ( ! isOnReaderFeed ) {
			return;
		}

		if ( currentView === 'recent' ) {
			queryClient.invalidateQueries( { queryKey: [ 'read', 'subscriptions-count' ] } );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dispatch( requestPaginatedStream( { streamKey: 'recent', page: 1, perPage: 10 } as any ) );
		} else {
			dispatch( clearStream( { streamKey: 'following' } ) );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dispatch( requestPage( { streamKey: 'following' } as any ) );
		}
	};
};
