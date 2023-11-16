import { UseQueryResult } from '@tanstack/react-query';
import { useSubscriberCountQuery } from '../queries';
import { SubscribersTotals, defaultSubscribersTotals } from '../queries/use-subscriber-count-query';

const useManySubsSite = ( siteId: number | null ) => {
	// email_subscribers includes WPCom subscribers and email subscribers
	const {
		data: subscribersTotals = defaultSubscribersTotals,
		isLoading,
	}: UseQueryResult< SubscribersTotals > = useSubscriberCountQuery( siteId );
	const totalSubscribers = subscribersTotals?.email_subscribers ?? 0;
	const hasManySubscribers = totalSubscribers > 30000; // 30000 is the limit of subscribers that can be fetched without breaking the endpoint. This is a temporal solution.

	return { hasManySubscribers, isLoading };
};

export default useManySubsSite;
