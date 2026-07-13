import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
	getStreamInfiniteQueryKeyPrefix,
	invalidatePaginatedStream,
} from 'calypso/reader/data/stream';
import { getOnThisDayStreamKey } from 'calypso/reader/on-this-day/get-stream-key';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Returns a callback that refreshes reader stream data after the user has
 * followed new sites or tags during onboarding.
 *
 * - The follows query is always invalidated to refresh shared follows state
 *   (e.g. sidebar site list).
 * - On `/reader` only (with optional locale prefix), clears and re-requests the
 *   aggregate `following` stream. `/reader/recent/:feedId` is scoped to a
 *   single feed in the UI; onboarding follows do not warrant reloading that.
 * - On `/reader/on-this-day` (with optional locale prefix), clears and
 *   re-requests the On This Day stream for the current route query args (see
 *   `getOnThisDayStreamKey`).
 */
export const useRefreshFollowingStreams = () => {
	const queryClient = useQueryClient();
	const queryArguments = useSelector( getCurrentQueryArguments );

	return () => {
		queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );

		const path = removeLocaleFromPathLocaleInFront( window.location.pathname );

		const isOnReaderFeed = path === '/reader';
		if ( isOnReaderFeed ) {
			queryClient.invalidateQueries( { queryKey: getStreamInfiniteQueryKeyPrefix( 'following' ) } );
		}

		const isOnThisDayRoute = path === '/reader/on-this-day';
		if ( isOnThisDayRoute ) {
			invalidatePaginatedStream( queryClient, getOnThisDayStreamKey( queryArguments ) );
		}
	};
};
