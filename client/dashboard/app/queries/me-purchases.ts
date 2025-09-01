import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchUserPurchases, fetchUserTransferredPurchases } from '../../data/me-purchases';
import { setPurchaseAutoRenew, fetchPurchase } from '../../data/upgrades';
import { queryClient } from '../query-client';

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

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'me', 'purchases', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = ( purchaseId: number ) =>
	mutationOptions( {
		mutationFn: ( autoRenew: boolean ) => setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( purchaseQuery( purchaseId ).queryKey, data.upgrade );
		},
	} );
