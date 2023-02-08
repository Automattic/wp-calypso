import type { IAppState } from 'calypso/state/types';

import 'calypso/state/billing-transactions/init';

/**
 * Returns all billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 */
export default function getBillingTransactions( state: IAppState ) {
	return state.billingTransactions?.items;
}
