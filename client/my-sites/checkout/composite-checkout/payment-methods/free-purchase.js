/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	useFormStatus,
	FormStatus,
	useLineItems,
	useEvents,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import WordPressLogo from '../components/wordpress-logo';

export function createFreePaymentMethod() {
	return {
		id: 'free-purchase',
		label: <WordPressFreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <WordPressFreePurchaseSummary />,
		getAriaLabel: ( __ ) => __( 'Free' ),
	};
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

function WordPressFreePurchaseLabel() {
	const { __ } = useI18n();

	return (
		<React.Fragment>
			<div>{ __( 'Free Purchase' ) }</div>
			<WordPressLogo />
		</React.Fragment>
	);
}

function WordPressFreePurchaseSummary() {
	const { __ } = useI18n();
	return <div>{ __( 'Free Purchase' ) }</div>;
}
