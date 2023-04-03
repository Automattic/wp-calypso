import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerSubscriptionsCount } from '../types';

const useSubscriptionsCountQuery = () => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	return useQuery< SubscriptionManagerSubscriptionsCount >(
		[ 'read', 'subscriptions-count', isLoggedIn ],
		async () => {
			return await callApi< SubscriptionManagerSubscriptionsCount >( {
				path: '/read/subscriptions-count',
				isLoggedIn,
			} );
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);
};

export default useSubscriptionsCountQuery;
