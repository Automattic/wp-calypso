import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const noop = () => undefined;

// The overloaded signatures help all the type info get inferred correctly when
// callbacks may or may not be passed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useTrackCallback< F extends ( ...args: any[] ) => any >(
	callback: F,
	eventName: string,
	eventProps?: Record< string, unknown >
): F;

function useTrackCallback(
	callback: undefined,
	eventName: string,
	eventProps?: Record< string, unknown >
): typeof noop;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useTrackCallback< F extends ( ...args: any[] ) => any >(
	callback: F | undefined,
	eventName: string,
	eventProps: Record< string, unknown > = {}
): F | typeof noop {
	const fn: F | typeof noop = callback ?? noop;

	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const trackedCallback = useCallback< F | typeof noop >(
		// @ts-expect-error It's totally ok for these args to be any.
		( ...rest ) => {
			dispatch(
				recordTracksEvent( eventName, {
					site_id: siteId,
					...eventProps,
				} )
			);
			return fn( ...rest );
		},
		[ callback, eventName, dispatch, siteId ]
	);
	return trackedCallback;
}

export default useTrackCallback;
