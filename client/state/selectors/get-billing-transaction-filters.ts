import {
	BillingTransactionsType,
	BillingTransactionUiState,
} from 'calypso/state/billing-transactions/types';
import { IAppState } from '../types';

import 'calypso/state/billing-transactions/init';

/**
 * Returns filter for the billing transactions of the given type
 */
export default function getBillingTransactionFilters(
	state: IAppState,
	transactionType: BillingTransactionsType
): BillingTransactionUiState {
	const filters = state.billingTransactions?.ui?.[ transactionType ] ?? {};
	return {
		app: '',
		date: { month: null, operator: null },
		page: 1,
		query: '',
		...filters,
	};
}
