/**
 * External dependencies
 */
import { useEffect, useCallback } from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { usePaymentMethodId } from '../lib/payment-methods';
import useMessages from './use-messages';
import useEvents from './use-events';
import { useFormStatus } from '../lib/form-status';
import { useTransactionStatus } from '../lib/transaction-status';

const debug = debugFactory( 'composite-checkout:transaction-status-handler' );

export default function TransactionStatusHandler( { redirectToUrl } ) {
	const defaultRedirect = useCallback( ( url ) => ( window.location = url ), [] );
	useTransactionStatusHandler( redirectToUrl || defaultRedirect );
	return null;
}

export function useTransactionStatusHandler( redirectToUrl ) {
	const { __ } = useI18n();
	const { showErrorMessage, showInfoMessage } = useMessages();
	const { setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const {
		previousTransactionStatus,
		transactionStatus,
		transactionRedirectUrl,
		transactionError,
		resetTransaction,
		setTransactionError,
	} = useTransactionStatus();
	const onEvent = useEvents();
	const [ paymentMethodId ] = usePaymentMethodId();

	const genericErrorMessage = __( 'An error occurred during the transaction' );
	const redirectErrormessage = __(
		'An error occurred while redirecting to the payment partner. Please try again or contact support.'
	);
	const redirectInfoMessage = __( 'Redirecting to payment partner…' );
	useEffect( () => {
		if ( transactionStatus === 'pending' && previousTransactionStatus !== 'pending' ) {
			debug( 'transaction is beginning' );
			setFormSubmitting();
		}
		if ( transactionStatus === 'error' && previousTransactionStatus !== 'error' ) {
			debug( 'showing error', transactionError );
			showErrorMessage( transactionError || genericErrorMessage );
			onEvent( {
				type: 'TRANSACTION_ERROR',
				payload: { message: transactionError || '', paymentMethodId },
			} );
			resetTransaction();
		}
		if ( transactionStatus === 'complete' && previousTransactionStatus !== 'complete' ) {
			debug( 'marking complete' );
			setFormComplete();
		}
		if ( transactionStatus === 'redirecting' && previousTransactionStatus !== 'redirecting' ) {
			if ( ! transactionRedirectUrl ) {
				debug( 'tried to redirect but there was no redirect url' );
				setTransactionError( redirectErrormessage );
				return;
			}
			debug( 'redirecting to', transactionRedirectUrl );
			showInfoMessage( redirectInfoMessage );
			redirectToUrl( transactionRedirectUrl );
		}
		if ( transactionStatus === 'not-started' && previousTransactionStatus !== 'not-started' ) {
			debug( 'transaction status has been reset; enabling form' );
			setFormReady();
		}
	}, [ transactionStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
