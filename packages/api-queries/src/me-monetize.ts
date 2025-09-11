import { fetchMonetizeSubscriptions } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const monetizeSubscriptionsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'monetize', 'subscriptions' ],
		queryFn: () => fetchMonetizeSubscriptions(),
	} );
