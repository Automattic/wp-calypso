import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SubscriptionManager } from '@automattic/data-stores';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';

const useRecordSubscriptionsTracksEvent = () => {
	const { portal } = useSubscriptionManagerContext();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();

	const recordSubscriptionsTracksEvent = ( tracksEventName: string, tracksEventProps?: object ) => {
		const subscription_count = counts?.blogs;

		recordTracksEvent( tracksEventName, {
			portal,
			subscription_count,
			...tracksEventProps,
		} );
	};

	return recordSubscriptionsTracksEvent;
};
export default useRecordSubscriptionsTracksEvent;
