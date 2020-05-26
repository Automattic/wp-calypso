/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
	useTransactionStatus,
	usePaymentProcessor,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

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
	const [ items, total ] = useLineItems();
	const { setTransactionComplete, setTransactionError } = useTransactionStatus();
	const { formStatus, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();
	const submitTransaction = usePaymentProcessor( 'free-purchase' );

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
