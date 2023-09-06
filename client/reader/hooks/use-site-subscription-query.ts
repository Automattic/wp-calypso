import { Reader } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';

const useSiteSubscriptionQuery = ( subscriptionId?: number ) => {
	const { isLoggedIn, id } = Reader.useIsLoggedIn();
	return useQuery( {
		queryKey: [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ],
		queryFn: async () => {
			return Reader.callApi< Reader.SiteSubscriptionDetails< string > >( {
				path: '/read/subscriptions/' + subscriptionId,
				isLoggedIn,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
			} );
		},
		enabled: typeof subscriptionId === 'number' && subscriptionId >= 0,
	} );
};

export default useSiteSubscriptionQuery;
