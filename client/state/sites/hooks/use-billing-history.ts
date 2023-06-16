import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { BillingTransaction } from 'calypso/state/billing-transactions/types';

export const billingTransactionsQueryKey = 'use-stored-payment-methods';

interface BillingHistory {
	billing_history: BillingTransaction[];
}

const fetchPastBillingTransactions = () =>
	wp.req.get( '/me/billing-history/past', {
		apiVersion: '1.3',
	} );

export const usePastBillingTransactions = () => {
	const queryKey = [ billingTransactionsQueryKey ];

	const { data, isLoading, error } = useQuery< BillingHistory, Error >( {
		queryKey,
		queryFn: () => fetchPastBillingTransactions(),
	} );

	return {
		billingTransactions: data?.billing_history || null,
		isLoading,
		error: error?.message || null,
	};
};
