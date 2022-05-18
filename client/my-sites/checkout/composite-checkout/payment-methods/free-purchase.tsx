import { Button, useFormStatus, FormStatus, useLineItems } from '@automattic/composite-checkout';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import WordPressLogo from '../components/wordpress-logo';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

export function createFreePaymentMethod(): PaymentMethod {
	return {
		id: 'free-purchase',
		paymentProcessorId: 'free-purchase',
		label: <WordPressFreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <WordPressFreePurchaseSummary />,
		getAriaLabel: ( __ ) => __( 'Free' ),
	};
}

function FreePurchaseSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const [ items ] = useLineItems();
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; FreePurchaseSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	const handleButtonPress = () => {
		onClick( {
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

function ButtonContents( { formStatus }: { formStatus: FormStatus } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		return <>{ __( 'Complete Checkout' ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function WordPressFreePurchaseLabel() {
	const { __ } = useI18n();

	return (
		<Fragment>
			<div>{ __( 'Free Purchase' ) }</div>
			<WordPressLogo />
		</Fragment>
	);
}

function WordPressFreePurchaseSummary() {
	const { __ } = useI18n();
	return <div>{ __( 'Free Purchase' ) }</div>;
}
