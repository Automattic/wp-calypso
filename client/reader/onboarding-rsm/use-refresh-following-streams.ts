import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { getOnThisDayStreamKey } from 'calypso/reader/on-this-day/get-stream-key';
import { useDispatch, useSelector } from 'calypso/state';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { clearStream, requestPage } from 'calypso/state/reader/streams/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Returns a callback that refreshes reader stream data after the user has
 * followed new sites or tags during onboarding.
 *
 * - `requestFollows` always runs to sync the Redux follows slice (e.g. sidebar
 *   site list).
 * - On `/reader` only (with optional locale prefix), clears and re-requests the
 *   aggregate `following` stream. `/reader/recent/:feedId` is scoped to a
 *   single feed in the UI; onboarding follows do not warrant reloading that.
 * - On `/reader/on-this-day` (with optional locale prefix), clears and
 *   re-requests the On This Day stream for the current route query args (see
 *   `getOnThisDayStreamKey`).
 */
export const useRefreshFollowingStreams = () => {
	const dispatch = useDispatch();
	const queryArguments = useSelector( getCurrentQueryArguments );

	return () => {
		dispatch( requestFollows() );

		const path = removeLocaleFromPathLocaleInFront( window.location.pathname );

		const refreshStream = ( streamKey: string ) => {
			dispatch( clearStream( { streamKey } ) );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stream actions payload typing
			dispatch( requestPage( { streamKey } as any ) );
		};

		const isOnReaderFeed = path === '/reader';
		if ( isOnReaderFeed ) {
			refreshStream( 'following' );
		}

		const isOnThisDayRoute = path === '/reader/on-this-day';
		if ( isOnThisDayRoute ) {
			refreshStream( getOnThisDayStreamKey( queryArguments ) );
		}
	};
};
