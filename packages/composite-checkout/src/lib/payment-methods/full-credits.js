/**
 * External dependencies
 */
import React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	FormStatus,
	useTransactionStatus,
	usePaymentProcessor,
	useLineItems,
	useEvents,
} from '../../public-api';
import { useFormStatus } from '../form-status';

export function createFullCreditsMethod() {
	return {
		id: 'full-credits',
		label: <FullCreditsLabel />,
		submitButton: <FullCreditsSubmitButton />,
		inactiveContent: <FullCreditsSummary />,
		getAriaLabel: ( __ ) => __( 'Credits' ),
	};
}

function FullCreditsLabel() {
	const { __ } = useI18n();

	return (
		<React.Fragment>
			<div>{ __( 'Credits' ) }</div>
			<div>{ __( 'Pay entirely with credits' ) }</div>
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
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return sprintf( __( 'Pay %s with WordPress.com Credits' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function FullCreditsSummary() {
	const { __ } = useI18n();
	return __( 'Pay using Credits' );
}
