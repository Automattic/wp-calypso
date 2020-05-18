/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useTransactionStatus,
	usePaymentProcessor,
	useMessages,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

const debug = debugFactory( 'composite-checkout:full-credits-payment-method' );

export function createFullCreditsMethod() {
	return {
		id: 'full-credits',
		label: <FullCreditsLabel />,
		submitButton: <FullCreditsSubmitButton />,
		inactiveContent: <FullCreditsSummary />,
		getAriaLabel: ( localize ) => localize( 'Credits' ),
	};
}

function FullCreditsLabel() {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<div>{ localize( 'Credits' ) }</div>
			<div>{ localize( 'Pay entirely with credits' ) }</div>
		</React.Fragment>
	);
}

function FullCreditsSubmitButton( { disabled } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { transactionStatus, transactionError } = useTransactionStatus();
	const { showErrorMessage } = useMessages();
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();
	const submitTransaction = usePaymentProcessor( 'full-credits' );

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			onEvent( { type: 'FULL_CREDITS_TRANSACTION_ERROR', payload: transactionError || '' } );
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'full credits transaction is complete' );
			setFormComplete();
		}
	}, [
		onEvent,
		setFormReady,
		setFormComplete,
		showErrorMessage,
		transactionStatus,
		transactionError,
		localize,
	] );

	const onClick = () => {
		setFormSubmitting();
		onEvent( { type: 'FULL_CREDITS_TRANSACTION_BEGIN' } );
		submitTransaction( {
			items,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ onClick }
			buttonState={ disabled ? 'disabled' : 'primary' }
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const localize = useLocalize();
	if ( formStatus === 'submitting' ) {
		return localize( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf(
			localize( 'Pay %s with WordPress.com Credits' ),
			renderDisplayValueMarkdown( total.amount.displayValue )
		);
	}
	return localize( 'Please wait…' );
}

function FullCreditsSummary() {
	const localize = useLocalize();
	return localize( 'Pay using Credits' );
}
