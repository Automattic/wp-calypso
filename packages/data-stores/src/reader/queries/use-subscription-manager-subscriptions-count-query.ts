import { useQuery } from 'react-query';
import { fetchFromApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerSubscriptionsCount } from '../types';

const useSubscriptionManagerSubscriptionsCountQuery = () => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	return useQuery(
		[ 'read', 'subscriptions-count', isLoggedIn ],
		async () => {
			return await fetchFromApi< SubscriptionManagerSubscriptionsCount >( {
				path: '/read/subscriptions-count',
				isLoggedIn,
			} );
		},
		{
			enabled,
			initialData: {
				blogs: null,
				comments: null,
				pending: null,
			},
		}
	);
};

export { useSubscriptionManagerSubscriptionsCountQuery };
