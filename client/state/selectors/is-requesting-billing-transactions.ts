import 'calypso/state/billing-transactions/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 */
export default function isRequestingBillingTransactions( state: IAppState ) {
	return state.billingTransactions?.requesting ?? false;
}
