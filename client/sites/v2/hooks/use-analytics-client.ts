import { useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import type { AnyRouter } from '@tanstack/react-router';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';

export const useAnalyticsClient = ( router?: AnyRouter, currentPath?: string ) => {
	const dispatch = useDispatch();

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				const path = currentPath || router?.state.matches.at( -1 )?.fullPath;
				const normalizedPath = path?.replace( /\/$/, '' );

				dispatch(
					recordTracksEvent( eventName, {
						path: normalizedPath,
						...properties,
					} )
				);
			},
			recordPageView( url, title ) {
				dispatch( recordPageView( url, title ) );
			},
		} ),
		[ router, currentPath, dispatch ]
	);

	return analyticsClient;
};
