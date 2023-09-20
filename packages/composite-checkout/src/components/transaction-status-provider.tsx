import { useMemo } from 'react';
import { TransactionStatusContext } from '../lib/transaction-status-context';
import type { TransactionStatusManager } from '../types';
import type { ReactNode } from 'react';

export function TransactionStatusProvider( {
	transactionStatusManager,
	children,
}: {
	transactionStatusManager: TransactionStatusManager;
	children: ReactNode;
} ) {
	const value: TransactionStatusManager = useMemo(
		() => transactionStatusManager,
		[ transactionStatusManager ]
	);
	return (
		<TransactionStatusContext.Provider value={ value }>
			{ children }
		</TransactionStatusContext.Provider>
	);
}
