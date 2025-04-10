import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useRef, useCallback } from 'react';
import { useTransactionStatus } from '../lib/transaction-status';
import { usePaymentMethodId } from '../public-api';
import { TransactionStatus } from '../types';
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

		if ( transactionStatus === TransactionStatus.ERROR ) {
			debug( 'an error occurred', transactionError );
			// Reset the transaction after the error has been registered (and
			// other listeners have had a chance to respond to it.)
			resetTransaction();
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
	}, [ transactionStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
}

// When form status or transaction status changes, call the appropriate callbacks.
function useCallStatusChangeCallbacks( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	transactionError,
	transactionStatus,
	paymentMethodId,
	transactionLastResponse,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	transactionError: string | null;
	transactionStatus: TransactionStatus;
	paymentMethodId: string | null | undefined;
	transactionLastResponse: PaymentProcessorResponseData;
} ): void {
	// Store the callbacks as refs so we do not call them more than once if they
	// are anonymous functions. This way they are only called when the
	// transactionStatus changes, which is what we really want.
	const paymentCompleteRef = useRef( onPaymentComplete );
	paymentCompleteRef.current = onPaymentComplete;
	const paymentRedirectRef = useRef( onPaymentRedirect );
	paymentRedirectRef.current = onPaymentRedirect;
	const paymentErrorRef = useRef( onPaymentError );
	paymentErrorRef.current = onPaymentError;

	const prevTransactionStatus = useRef< TransactionStatus >();

	useEffect( () => {
		if ( transactionStatus === prevTransactionStatus.current ) {
			return;
		}
		if ( paymentCompleteRef.current && transactionStatus === TransactionStatus.COMPLETE ) {
			debug( "transactionStatus status changed to complete so I'm calling onPaymentComplete" );
			paymentCompleteRef.current( { transactionLastResponse } );
		}
		if ( paymentRedirectRef.current && transactionStatus === TransactionStatus.REDIRECTING ) {
			debug( "transaction status changed to redirecting so I'm calling onPaymentRedirect" );
			paymentRedirectRef.current( { transactionLastResponse } );
		}
		if ( paymentErrorRef.current && transactionStatus === TransactionStatus.ERROR ) {
			debug( "transaction status changed to error so I'm calling onPaymentError" );
			paymentErrorRef.current( { paymentMethodId, transactionError } );
		}
		prevTransactionStatus.current = transactionStatus;
	}, [ transactionStatus, paymentMethodId, transactionLastResponse, transactionError ] );
}
