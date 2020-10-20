/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import { FormStatus, useLineItems, useEvents } from '../../public-api';
import { useFormStatus } from '../form-status';

export function createFreePaymentMethod() {
	return {
		id: 'free-purchase',
		label: <FreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <FreePurchaseSummary />,
		getAriaLabel: ( __ ) => __( 'Free' ),
	};
}

function FreePurchaseLabel() {
	const { __ } = useI18n();

	return (
		<React.Fragment>
			<div>{ __( 'Free Purchase' ) }</div>
		</React.Fragment>
	);
}

function FreePurchaseSubmitButton( { disabled, onClick } ) {
	const [ items ] = useLineItems();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();

	const handleButtonPress = () => {
		onEvent( { type: 'FREE_TRANSACTION_BEGIN' } );
		onClick( 'free-purchase', {
			items,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } />
		</Button>
	);
}

function ButtonContents( { formStatus } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return __( 'Complete Checkout' );
	}
	return __( 'Please wait…' );
}

function FreePurchaseSummary() {
	const { __ } = useI18n();
	return <div>{ __( 'Free Purchase' ) }</div>;
}
