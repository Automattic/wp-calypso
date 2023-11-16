import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerSubscriptionsCount } from '../types';

export const subscriptionsCountQueryKeyPrefix = [ 'read', 'subscriptions-count' ];

const useSubscriptionsCountQuery = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( subscriptionsCountQueryKeyPrefix );

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
