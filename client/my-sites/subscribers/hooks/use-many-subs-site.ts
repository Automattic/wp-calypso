import useSubscribersTotalsQueries from 'calypso/my-sites/stats/hooks/use-subscribers-totals-query';

const useManySubsSite = ( siteId: number | null ) => {
	const { data: subscribersTotals = { total: 0 }, isLoading } =
		useSubscribersTotalsQueries( siteId );
	const totalSubscribers = subscribersTotals?.total ?? 0;
	const hasManySubscribers = totalSubscribers > 30000; // 30000 is the limit of subscribers that can be fetched without breaking the endpoint. This is a temporal solution.

	return { hasManySubscribers, isLoading };
};

export default useManySubsSite;
