import getBillingTransactions from 'calypso/state/selectors/get-billing-transactions';
import type { IAppState } from 'calypso/state/types';

import 'calypso/state/billing-transactions/init';

/**
 * Returns all upcoming billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 */
export default function getUpcomingBillingTransactions( state: IAppState ) {
	return getBillingTransactions( state )?.upcoming ?? null;
}
