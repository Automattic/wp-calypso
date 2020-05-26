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
	useMessages,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
	useTransactionStatus,
	usePaymentProcessor,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

const debug = debugFactory( 'composite-checkout:free-purchase-payment-method' );

export function createFreePaymentMethod() {
	return {
		id: 'free-purchase',
		label: <FreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <FreePurchaseSummary />,
		getAriaLabel: ( localize ) => localize( 'Free' ),
	};
}

function FreePurchaseLabel() {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<div>{ localize( 'Free Purchase' ) }</div>
		</React.Fragment>
	);
}

function FreePurchaseSubmitButton( { disabled } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const {
		transactionStatus,
		transactionError,
		setTransactionComplete,
		setTransactionError,
	} = useTransactionStatus();
	const { showErrorMessage } = useMessages();
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();
	const submitTransaction = usePaymentProcessor( 'free-purchase' );

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			onEvent( { type: 'FREE_PURCHASE_TRANSACTION_ERROR', payload: transactionError || '' } );
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'free transaction is complete' );
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
		onEvent( { type: 'FREE_TRANSACTION_BEGIN' } );
		submitTransaction( {
			items,
		} )
			.then( () => {
				setTransactionComplete();
			} )
			.catch( ( error ) => {
				setTransactionError( error.message );
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
			localize( 'Complete Checkout' ),
			renderDisplayValueMarkdown( total.amount.displayValue )
		);
	}
	return localize( 'Please wait…' );
}

function FreePurchaseSummary() {
	const localize = useLocalize();
	return <div>{ localize( 'Free Purchase' ) }</div>;
}
