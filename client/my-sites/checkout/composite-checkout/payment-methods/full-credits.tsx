import { Button, FormStatus, useLineItems, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import WordPressLogo from '../components/wordpress-logo';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

export function createFullCreditsMethod(): PaymentMethod {
	return {
		id: 'full-credits',
		paymentProcessorId: 'full-credits',
		label: <WordPressCreditsLabel />,
		submitButton: <FullCreditsSubmitButton />,
		inactiveContent: <WordPressCreditsSummary />,
		getAriaLabel: ( __ ) => __( 'Credits' ),
	};
}

function FullCreditsSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const [ items ] = useLineItems();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; FullCreditsSubmitButton must be used as a payment button in CheckoutSubmitButton'
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
			<ButtonContents
				formStatus={ formStatus }
				total={ responseCart.sub_total_with_taxes_display }
			/>
		</Button>
	);
}

function ButtonContents( { formStatus, total }: { formStatus: FormStatus; total: string } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return <>{ sprintf( __( 'Pay %s with credits' ), total ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function WordPressCreditsLabel() {
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	return (
		<Fragment>
			<div>
				{
					/* translators: %(amount)s is the total amount of credits available in localized currency */
					sprintf( __( 'WordPress.com Credits: %(amount)s available' ), {
						amount: responseCart.credits_display,
					} )
				}
			</div>
			<WordPressLogo />
		</Fragment>
	);
}

function WordPressCreditsSummary() {
	const { __ } = useI18n();
	return <div>{ __( 'WordPress.com Credits' ) }</div>;
}
