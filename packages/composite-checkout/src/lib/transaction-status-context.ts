import { createContext } from 'react';
import { TransactionStatus, TransactionStatusManager } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const defaultTransactionStatusContext: TransactionStatusManager = {
	transactionStatus: TransactionStatus.NOT_STARTED,
	previousTransactionStatus: TransactionStatus.NOT_STARTED,
	transactionLastResponse: null,
	transactionError: null,
	transactionRedirectUrl: null,
	resetTransaction: noop,
	setTransactionError: noop,
	setTransactionComplete: noop,
	setTransactionPending: noop,
	setTransactionRedirecting: noop,
};

export const TransactionStatusContext = createContext( defaultTransactionStatusContext );
