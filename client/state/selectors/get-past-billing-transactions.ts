import getBillingTransactions from 'calypso/state/selectors/get-billing-transactions';
import type { IAppState } from 'calypso/state/types';

import 'calypso/state/billing-transactions/init';

/**
 * Returns all past billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 */
export default function getPastBillingTransactions( state: IAppState ) {
	return getBillingTransactions( state )?.past ?? null;
}
