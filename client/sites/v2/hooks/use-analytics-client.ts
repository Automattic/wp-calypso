import { useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';

export const useAnalyticsClient = () => {
	const dispatch = useDispatch();

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				dispatch( recordTracksEvent( eventName, properties ) );
			},
			recordPageView( url, title ) {
				dispatch( recordPageView( url, title ) );
			},
		} ),
		[ dispatch ]
	);

	return analyticsClient;
};
