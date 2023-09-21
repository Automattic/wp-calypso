import { ReactNode } from 'react';
import { useFormStatusManager } from '../lib/form-status';
import { useTransactionStatusManager } from '../lib/transaction-status';
import FormAndTransactionEventHandler from './form-and-transaction-event-handler';
import { FormStatusProvider } from './form-status-provider';
import { TransactionStatusProvider } from './transaction-status-provider';
import type { PaymentEventCallback, PaymentErrorCallback } from '../types';

export function FormAndTransactionProvider( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	isLoading,
	isValidating,
	redirectToUrl,
	children,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	isLoading?: boolean;
	isValidating?: boolean;
	redirectToUrl?: ( url: string ) => void;
	children?: ReactNode;
} ) {
	// Keep track of form status state (loading, validating, ready, etc).
	const formStatusManager = useFormStatusManager( Boolean( isLoading ), Boolean( isValidating ) );

	// Keep track of transaction status state (pending, complete, redirecting, etc).
	const transactionStatusManager = useTransactionStatusManager();

	return (
		<TransactionStatusProvider transactionStatusManager={ transactionStatusManager }>
			<FormStatusProvider formStatusManager={ formStatusManager }>
				<FormAndTransactionEventHandler
					onPaymentComplete={ onPaymentComplete }
					onPaymentRedirect={ onPaymentRedirect }
					onPaymentError={ onPaymentError }
					redirectToUrl={ redirectToUrl }
				/>
				{ children }
			</FormStatusProvider>
		</TransactionStatusProvider>
	);
}
