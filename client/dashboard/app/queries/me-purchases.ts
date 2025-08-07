import { queryOptions } from '@tanstack/react-query';
import { fetchUserPurchases, fetchUserTransferredPurchases } from '../../data/me-purchases';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'purchases' ],
		queryFn: () => fetchUserPurchases(),
	} );

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'me', 'purchases', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
	} );
}
