import {
	fetchUserPurchases,
	setPurchaseAutoRenew,
	fetchPurchase,
	assignPaymentMethod,
	cancelAndRefundPurchase,
	extendPurchaseWithFreeMonth,
	removePurchase,
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

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = ( purchaseId: number ) =>
	mutationOptions( {
		mutationFn: ( autoRenew: boolean ) => setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( purchaseQuery( purchaseId ).queryKey, data.upgrade );
		},
	} );

export const assignPaymentMethodMutation = () =>
	mutationOptions( {
		mutationFn: ( params: AssignPaymentMethodParams ) => assignPaymentMethod( params ),
	} );

export const removePurchaseMutation = () =>
	mutationOptions( {
		mutationFn: removePurchase,
	} );

export const cancelAndRefundPurchaseMutation = (
	purchaseId: number,
	options: PurchaseCancelOptions | PurchaseDowngradeOptions
) =>
	mutationOptions( {
		mutationFn: () => cancelAndRefundPurchase( purchaseId, options ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const extendPurchaseWithFreeMonthMutation = ( purchaseId: number ) =>
	mutationOptions( {
		mutationFn: () => extendPurchaseWithFreeMonth( purchaseId ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );
