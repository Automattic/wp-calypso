/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useTransactionStatus,
	usePaymentProcessor,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

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
	const [ items, total ] = useLineItems();
	const {
		setTransactionComplete,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const submitTransaction = usePaymentProcessor( 'full-credits' );

	const onClick = () => {
		setTransactionPending();
		onEvent( { type: 'FULL_CREDITS_TRANSACTION_BEGIN' } );
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
