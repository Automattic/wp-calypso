import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useEffect } from 'react';
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

function useTransactionStatusHandler( redirectToUrl: ( url: string ) => void ): void {
	const { __ } = useI18n();
	const { setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const {
		previousTransactionStatus,
		transactionStatus,
		transactionRedirectUrl,
		transactionError,
		resetTransaction,
		setTransactionError,
	} = useTransactionStatus();

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
			redirectToUrl( transactionRedirectUrl );
		}
		if ( transactionStatus === TransactionStatus.NOT_STARTED ) {
			debug( 'transaction status has been reset; enabling form' );
			setFormReady();
		}
	}, [ transactionStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
