import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useRef, useCallback } from 'react';
import { useFormStatus } from '../lib/form-status';
import { useTransactionStatus } from '../lib/transaction-status';
import { usePaymentMethodId } from '../public-api';
import { FormStatus, TransactionStatus } from '../types';
import type {
	PaymentEventCallback,
	PaymentErrorCallback,
	PaymentProcessorResponseData,
} from '../types';

const debug = debugFactory( 'composite-checkout:transaction-status-handler' );

/**
 * Helper component to take an action when the form or transaction status changes.
 *
 * For example, if the transaction status changes to "pending", this will set
 * the form status to "submitting"; if the transaction status changes to
 * "redirecting", this will perform the redirect. If there is an error, the
 * `onPaymentError` callback will be called.
 */
export default function FormAndTransactionEventHandler( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	redirectToUrl,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	redirectToUrl?: ( url: string ) => void;
} ): null {
	useTransactionStatusHandler( {
		onPaymentComplete,
		onPaymentRedirect,
		onPaymentError,
		redirectToUrl,
	} );
	return null;
}

export function useTransactionStatusHandler( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	redirectToUrl,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	redirectToUrl?: ( url: string ) => void;
} ): void {
	// @ts-expect-error window.location can accept a string, but the types don't like it.
	const defaultRedirect = useCallback( ( url: string ) => ( window.location = url ), [] );
	const performRedirect = redirectToUrl ?? defaultRedirect;

	const { __ } = useI18n();
	const [ paymentMethodId ] = usePaymentMethodId();
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const {
		previousTransactionStatus,
		transactionLastResponse,
		transactionStatus,
		transactionRedirectUrl,
		transactionError,
		resetTransaction,
		setTransactionError,
	} = useTransactionStatus();

	// When form status or transaction status changes, call the appropriate callbacks.
	useCallStatusChangeCallbacks( {
		onPaymentComplete,
		onPaymentRedirect,
		onPaymentError,
		formStatus,
		transactionError,
		transactionStatus,
		paymentMethodId,
		transactionLastResponse,
	} );

	const redirectErrormessage = __(
		'An error occurred while redirecting to the payment partner. Please try again or contact support.'
	);
	useEffect( () => {
		if ( transactionStatus === previousTransactionStatus ) {
			return;
		}

		if ( transactionStatus === TransactionStatus.PENDING ) {
			debug( 'transaction is beginning' );
			setFormSubmitting();
		}
		if ( transactionStatus === TransactionStatus.ERROR ) {
			debug( 'an error occurred', transactionError );
			resetTransaction();
		}
		if ( transactionStatus === TransactionStatus.COMPLETE ) {
			debug( 'marking complete' );
			setFormComplete();
		}
		if ( transactionStatus === TransactionStatus.REDIRECTING ) {
			if ( ! transactionRedirectUrl ) {
				debug( 'tried to redirect but there was no redirect url' );
				setTransactionError( redirectErrormessage );
				return;
			}
			debug( 'redirecting to', transactionRedirectUrl );
			performRedirect( transactionRedirectUrl );
		}
		if ( transactionStatus === TransactionStatus.NOT_STARTED ) {
			debug( 'transaction status has been reset; enabling form' );
			setFormReady();
		}
	}, [ transactionStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
}

// When form status or transaction status changes, call the appropriate callbacks.
function useCallStatusChangeCallbacks( {
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
