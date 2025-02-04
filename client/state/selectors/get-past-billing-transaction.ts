import { createSelector } from '@automattic/state-utils';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import type { BillingTransaction } from '../billing-transactions/types';
import type { IAppState } from '../types';

import 'calypso/state/billing-transactions/init';

/**
 * Utility function to retrieve a transaction from individualTransactions state subtree
 */
const getIndividualBillingTransaction = (
	state: IAppState,
	id: number
): BillingTransaction | null =>
	state.billingTransactions?.individualTransactions?.[ id ]?.data ?? null;

/**
 * Returns a past billing transaction.
 * Looks for the transaction in the most recent billing transactions and then looks for individually-fetched transactions
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 */
export default createSelector(
	( state: IAppState, id: number ) =>
		getPastBillingTransactions( state )?.find(
			( transaction ) => String( transaction.id ) === String( id )
		) || getIndividualBillingTransaction( state, id ),
	( state: IAppState, id: number ) => [
		getPastBillingTransactions( state ),
		getIndividualBillingTransaction( state, id ),
	]
);
