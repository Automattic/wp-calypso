import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SubscriptionManager } from '@automattic/data-stores';
import { useCallback } from 'react';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';

const useRecordSubscriptionsTracksEvent = () => {
	const { portal } = useSubscriptionManagerContext();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();

	const recordSubscriptionsTracksEvent = useCallback(
		( tracksEventName: string, tracksEventProps?: object ) => {
			const subscription_count = counts?.blogs;

			recordTracksEvent( tracksEventName, {
				portal,
				subscription_count,
				...tracksEventProps,
			} );
		},
		[ counts?.blogs, portal ]
	);

	return recordSubscriptionsTracksEvent;
};
export default useRecordSubscriptionsTracksEvent;
