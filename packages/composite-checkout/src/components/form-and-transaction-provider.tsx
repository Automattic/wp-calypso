import { ReactNode, useEffect } from 'react';
import { useFormAndTransactionStatusManager } from '../lib/form-and-transaction-status';
import { FormStatus } from '../types';
import FormAndTransactionEventHandler from './form-and-transaction-event-handler';
import { FormStatusProvider } from './form-status-provider';
import { TransactionStatusProvider } from './transaction-status-provider';
import type { PaymentEventCallback, PaymentErrorCallback } from '../types';

function getNewStatusFromProps( {
	isLoading,
	isValidating,
}: {
	isLoading: boolean;
	isValidating: boolean;
} ): FormStatus {
	if ( isLoading ) {
		return FormStatus.LOADING;
	}
	if ( isValidating ) {
		return FormStatus.VALIDATING;
	}
	return FormStatus.READY;
}

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
	const statusManager = useFormAndTransactionStatusManager();

	const {
		formStatus,
		setFormStatus,
		transactionStatus,
		previousTransactionStatus,
		transactionError,
		transactionLastResponse,
		transactionRedirectUrl,
		resetTransaction,
		setTransactionError,
		setTransactionComplete,
		setTransactionPending,
		setTransactionRedirecting,
	} = statusManager;

	useEffect( () => {
		const newStatus = getNewStatusFromProps( {
			isLoading: isLoading || false,
			isValidating: isValidating || false,
		} );
		setFormStatus( newStatus );
	}, [ isLoading, isValidating, setFormStatus ] );

	return (
		<TransactionStatusProvider
			transactionStatusManager={ {
				transactionStatus,
				previousTransactionStatus,
				transactionError,
				transactionLastResponse,
				transactionRedirectUrl,
				resetTransaction,
				setTransactionError,
				setTransactionComplete,
				setTransactionPending,
				setTransactionRedirecting,
			} }
		>
			<FormStatusProvider
				formStatusManager={ {
					formStatus,
					setFormStatus,
				} }
			>
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
