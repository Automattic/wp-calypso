import { useCallback } from 'react';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordSearchByUrlPerformed = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordSearchByUrlPerformed = useCallback(
		( tracksProps: { url: string } ) => {
			// reader: calypso_render_following_manage_follow_by_url_render
			// subman: calypso_subscriptions_search_by_url_performed
			recordSubscriptionsTracksEvent(
				'calypso_subscriptions_search_by_url_performed',
				tracksProps
			);
		},
		[ recordSubscriptionsTracksEvent ]
	);

	return recordSearchByUrlPerformed;
};

export default useRecordSearchByUrlPerformed;
