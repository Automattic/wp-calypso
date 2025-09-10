import { queryOptions } from '@tanstack/react-query';
import { fetchMonetizeSubscriptions } from '@automattic/api-core';

export const monetizeSubscriptionsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'monetize', 'subscriptions' ],
		queryFn: () => fetchMonetizeSubscriptions(),
	} );
