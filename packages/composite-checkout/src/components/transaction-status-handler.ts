/**
 * External dependencies
 */
import { useCallback, useEffect } from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import useMessages from './use-messages';
import { useFormStatus } from '../lib/form-status';
import { useTransactionStatus } from '../lib/transaction-status';
import { TransactionStatus } from '../types';

const debug = debugFactory( 'composite-checkout:transaction-status-handler' );

export default function TransactionStatusHandler( {
	redirectToUrl,
}: {
	redirectToUrl?: ( url: string ) => void;
} ): null {
	const defaultRedirect = useCallback( ( url ) => ( window.location = url ), [] );
	useTransactionStatusHandler( redirectToUrl || defaultRedirect );
	return null;
}

export function useTransactionStatusHandler( redirectToUrl: ( url: string ) => void ): void {
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

	const genericErrorMessage = __( 'An error occurred during the transaction' );
	const redirectErrormessage = __(
		'An error occurred while redirecting to the payment partner. Please try again or contact support.'
	);
	const redirectInfoMessage = __( 'Redirecting to payment partner…' );
	useEffect( () => {
		if ( transactionStatus === previousTransactionStatus ) {
			return;
		}

		if ( transactionStatus === TransactionStatus.PENDING ) {
			debug( 'transaction is beginning' );
			setFormSubmitting();
		}
		if ( transactionStatus === TransactionStatus.ERROR ) {
			debug( 'showing error', transactionError );
			showErrorMessage( transactionError || genericErrorMessage );
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
			showInfoMessage( redirectInfoMessage );
			redirectToUrl( transactionRedirectUrl );
		}
		if ( transactionStatus === TransactionStatus.NOT_STARTED ) {
			debug( 'transaction status has been reset; enabling form' );
			setFormReady();
		}
	}, [ transactionStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
