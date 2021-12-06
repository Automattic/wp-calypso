import { Button, useFormStatus, FormStatus, useLineItems } from '@automattic/composite-checkout';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
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

	const handleButtonPress = () => {
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
