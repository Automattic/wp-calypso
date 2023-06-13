import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import {
	BillingTransaction,
	BillingTransactionsType,
} from 'calypso/state/billing-transactions/types';

export const billingTransactionsQueryKey = 'use-stored-payment-methods';

interface BillingHistory {
	billing_history: BillingTransaction[];
}

const fetchBillingTransactions = ( transactionType?: BillingTransactionsType ) =>
	wp.req.get( `/me/billing-history` + ( transactionType ? `/${ transactionType }` : '' ), {
		apiVersion: '1.3',
	} );

export const useBillingTransactions = ( transactionType?: BillingTransactionsType ) => {
	const queryKey = [ billingTransactionsQueryKey, transactionType ];

	const { data, isLoading, error } = useQuery< BillingHistory, Error >( {
		queryKey,
		queryFn: () => fetchBillingTransactions( transactionType ),
	} );

	return {
		billingTransactions: data?.billing_history || null,
		isLoading,
		error: error?.message || null,
	};
};
