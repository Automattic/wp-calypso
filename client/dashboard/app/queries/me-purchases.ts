import { queryOptions } from '@tanstack/react-query';
import { fetchUserPurchases } from '../../data/me-purchases';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'active-subscriptions' ],
		queryFn: () => fetchUserPurchases(),
	} );
