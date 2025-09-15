import { useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import type { AnyRouter } from '@tanstack/react-router';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';

export const useAnalyticsClient = ( router: AnyRouter ) => {
	const dispatch = useDispatch();

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				const path = router.state.matches.at( -1 )?.fullPath;
				dispatch(
					recordTracksEvent( eventName, {
						path,
						...properties,
					} )
				);
			},
			recordPageView( url, title ) {
				dispatch( recordPageView( url, title ) );
			},
		} ),
		[ router, dispatch ]
	);

	return analyticsClient;
};
