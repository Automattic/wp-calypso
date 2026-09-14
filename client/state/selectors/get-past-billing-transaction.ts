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

function mergeTaxIsForBusiness(
	individualValue?: boolean | null,
	pastValue?: boolean | null
): boolean | null | undefined {
	if ( individualValue === true || pastValue === true ) {
		return true;
	}

	return individualValue ?? pastValue;
}

/**
 * Returns a past billing transaction.
 * Looks for the transaction in the most recent billing transactions and then looks for individually-fetched transactions
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 */
export default createSelector(
	( state: IAppState, id: number ) => {
		const pastTransaction = getPastBillingTransactions( state )?.find(
			( transaction ) => String( transaction.id ) === String( id )
		);
		const individualTransaction = getIndividualBillingTransaction( state, id );

		if ( pastTransaction && individualTransaction ) {
			return {
				...pastTransaction,
				...individualTransaction,
				tax_is_for_business: mergeTaxIsForBusiness(
					individualTransaction.tax_is_for_business,
					pastTransaction.tax_is_for_business
				),
				tax_state: individualTransaction.tax_state || pastTransaction.tax_state,
			};
		}

		return individualTransaction || pastTransaction || null;
	},
	( state: IAppState, id: number ) => [
		getPastBillingTransactions( state ),
		getIndividualBillingTransaction( state, id ),
	]
);
