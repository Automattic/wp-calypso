import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import getUpcomingBillingTransactions from 'calypso/state/selectors/get-upcoming-billing-transactions';
import type { IAppState } from '../types';
import type {
	BillingTransaction,
	BillingTransactionsType,
	BillingTransactionsTypePast,
	BillingTransactionsTypeUpcoming,
	UpcomingCharge,
} from 'calypso/state/billing-transactions/types';

import 'calypso/state/billing-transactions/init';

/**
 * Returns billing transactions of the provided type.
 * Returns null if the billing transactions have not been fetched yet.
 */
export function getBillingTransactionsByType(
	state: IAppState,
	transactionType: BillingTransactionsTypeUpcoming
): UpcomingCharge[] | null;
export function getBillingTransactionsByType(
	state: IAppState,
	transactionType: BillingTransactionsTypePast
): BillingTransaction[] | null;
export function getBillingTransactionsByType(
	state: IAppState,
	transactionType: BillingTransactionsType
) {
	return 'upcoming' === transactionType
		? getUpcomingBillingTransactions( state )
		: getPastBillingTransactions( state );
}

export default getBillingTransactionsByType;
