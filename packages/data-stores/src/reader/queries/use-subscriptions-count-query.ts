import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerSubscriptionsCount } from '../types';

const useSubscriptionsCountQuery = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

	return useQuery< SubscriptionManagerSubscriptionsCount >( {
		queryKey: cacheKey,
		queryFn: async () => {
			return await callApi< SubscriptionManagerSubscriptionsCount >( {
				path: '/read/subscriptions-count',
				isLoggedIn,
			} );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useSubscriptionsCountQuery;
