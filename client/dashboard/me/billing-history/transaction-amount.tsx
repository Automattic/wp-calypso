import { getTransactionAmount } from './utils';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function TransactionAmount( { transaction }: { transaction: BillingTransaction } ) {
	return <span>{ getTransactionAmount( transaction ) }</span>;
}
