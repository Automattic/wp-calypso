import debugFactory from 'debug';
import { ReactNode, useEffect, useRef } from 'react';
import { useFormStatusManager } from '../lib/form-status';
import { useTransactionStatusManager } from '../lib/transaction-status';
import { usePaymentMethodId } from '../public-api';
import { FormStatus, TransactionStatus } from '../types';
import { FormStatusProvider } from './form-status-provider';
import TransactionStatusHandler from './transaction-status-handler';
import { TransactionStatusProvider } from './transaction-status-provider';
import type {
	PaymentEventCallback,
	PaymentErrorCallback,
	PaymentProcessorResponseData,
} from '../types';

const debug = debugFactory( 'composite-checkout:form-and-transaction-status-provider' );

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
	const [ paymentMethodId ] = usePaymentMethodId();

	// Keep track of form status state (loading, validating, ready, etc).
	const formStatusManager = useFormStatusManager( Boolean( isLoading ), Boolean( isValidating ) );

	// Keep track of transaction status state (pending, complete, redirecting, etc).
	const transactionStatusManager = useTransactionStatusManager();
	const { transactionLastResponse, transactionStatus, transactionError } = transactionStatusManager;

	// When form status or transaction status changes, call the appropriate callbacks.
	useCallEventCallbacks( {
		onPaymentComplete,
		onPaymentRedirect,
		onPaymentError,
		formStatus: formStatusManager.formStatus,
		transactionError,
		transactionStatus,
		paymentMethodId,
		transactionLastResponse,
	} );

	return (
		<TransactionStatusProvider transactionStatusManager={ transactionStatusManager }>
			<FormStatusProvider formStatusManager={ formStatusManager }>
				<TransactionStatusHandler redirectToUrl={ redirectToUrl } />
				{ children }
			</FormStatusProvider>
		</TransactionStatusProvider>
	);
}

// When form status or transaction status changes, call the appropriate callbacks.
function useCallEventCallbacks( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	formStatus,
	transactionError,
	transactionStatus,
	paymentMethodId,
	transactionLastResponse,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	formStatus: FormStatus;
	transactionError: string | null;
	transactionStatus: TransactionStatus;
	paymentMethodId: string | null;
	transactionLastResponse: PaymentProcessorResponseData;
} ): void {
	// Store the callbacks as refs so we do not call them more than once if they
	// are anonymous functions. This way they are only called when the
	// transactionStatus/formStatus changes, which is what we really want.
	const paymentCompleteRef = useRef( onPaymentComplete );
	paymentCompleteRef.current = onPaymentComplete;
	const paymentRedirectRef = useRef( onPaymentRedirect );
	paymentRedirectRef.current = onPaymentRedirect;
	const paymentErrorRef = useRef( onPaymentError );
	paymentErrorRef.current = onPaymentError;

	const prevFormStatus = useRef< FormStatus >();
	const prevTransactionStatus = useRef< TransactionStatus >();

	useEffect( () => {
		if (
			paymentCompleteRef.current &&
			formStatus === FormStatus.COMPLETE &&
			formStatus !== prevFormStatus.current
		) {
			debug( "form status changed to complete so I'm calling onPaymentComplete" );
			paymentCompleteRef.current( { paymentMethodId, transactionLastResponse } );
		}
		prevFormStatus.current = formStatus;
	}, [ formStatus, transactionLastResponse, paymentMethodId ] );

	useEffect( () => {
		if (
			paymentRedirectRef.current &&
			transactionStatus === TransactionStatus.REDIRECTING &&
			transactionStatus !== prevTransactionStatus.current
		) {
			debug( "transaction status changed to redirecting so I'm calling onPaymentRedirect" );
			paymentRedirectRef.current( { paymentMethodId, transactionLastResponse } );
		}
		if (
			paymentErrorRef.current &&
			transactionStatus === TransactionStatus.ERROR &&
			transactionStatus !== prevTransactionStatus.current
		) {
			debug( "transaction status changed to error so I'm calling onPaymentError" );
			paymentErrorRef.current( { paymentMethodId, transactionError } );
		}
		prevTransactionStatus.current = transactionStatus;
	}, [ transactionStatus, paymentMethodId, transactionLastResponse, transactionError ] );
}
