import {
	fetchUserPurchases,
	setPurchaseAutoRenew,
	fetchPurchase,
	assignPaymentMethod,
	cancelAndRefundPurchase,
	extendPurchaseWithFreeMonth,
	removePurchase,
	hasExtendedPurchase,
	fetchUserTransferredPurchases,
	fetchSitePurchases,
	fetchCancellationFeatures,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type {
	AssignPaymentMethodParams,
	PurchaseCancelOptions,
	PurchaseDowngradeOptions,
} from '@automattic/api-core';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'upgrades' ],
		queryFn: () => fetchUserPurchases(),
	} );

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'upgrades', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
	} );
}

export const sitePurchasesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', 'site', siteId ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

export const purchaseCancelFeaturesQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId, 'cancel-features' ],
		queryFn: () => fetchCancellationFeatures( purchaseId ),
	} );

export const hasPurchaseBeenExtendedQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId, 'has-extended' ],
		queryFn: () => hasExtendedPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = () =>
	mutationOptions( {
		mutationFn: ( { purchaseId, autoRenew }: { purchaseId: number; autoRenew: boolean } ) =>
			setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const assignPaymentMethodMutation = () =>
	mutationOptions( {
		mutationFn: ( params: AssignPaymentMethodParams ) => assignPaymentMethod( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const removePurchaseMutation = () =>
	mutationOptions( {
		mutationFn: removePurchase,
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const cancelAndRefundPurchaseMutation = () =>
	mutationOptions( {
		mutationFn: ( params: {
			purchaseId: number;
			options: PurchaseCancelOptions | PurchaseDowngradeOptions;
		} ) => cancelAndRefundPurchase( params.purchaseId, params.options ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const extendPurchaseWithFreeMonthMutation = () =>
	mutationOptions( {
		mutationFn: ( purchaseId: number ) => extendPurchaseWithFreeMonth( purchaseId ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );
