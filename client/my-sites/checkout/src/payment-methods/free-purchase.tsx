import { PRODUCT_AKISMET_FREE } from '@automattic/calypso-products';
import { Button, useFormStatus, FormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { formatCurrency } from 'i18n-calypso';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
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
		onClick( {} );
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
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const doesCartHaveRenewalWithPaymentMethod = responseCart.products.some(
		( product ) => product.is_renewal_and_will_auto_renew
	);
	const isCartAllOneTimePurchases = responseCart.products.every(
		( product ) => product.is_one_time_purchase
	);
	// Don't show additional free payment methods if all products in the cart prevent them.
	// Currently only Akismet Free explicitly prevents them.
	const isCartAllProductsThatPreventAdditionalFreeMethods = responseCart.products.every(
		( product ) => product.product_slug === PRODUCT_AKISMET_FREE
	);

	if (
		! isCartAllOneTimePurchases &&
		! doesCartHaveRenewalWithPaymentMethod &&
		! isCartAllProductsThatPreventAdditionalFreeMethods
	) {
		return (
			<>
				<div>{ __( 'Assign a payment method later' ) }</div>
				<WordPressLogo />
			</>
		);
	}

	if ( doesPurchaseHaveFullCredits( responseCart ) ) {
		return (
			<>
				<div>
					{
						/* translators: %(amount)s is the total amount of credits available in localized currency */
						sprintf( __( 'WordPress.com Credits: %(amount)s available' ), {
							amount: formatCurrency( responseCart.credits_integer, responseCart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						} )
					}
				</div>
				<WordPressLogo />
			</>
		);
	}

	return (
		<>
			<div>{ __( 'Free Purchase' ) }</div>
			<WordPressLogo />
		</>
	);
}

function WordPressFreePurchaseSummary() {
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	if ( doesPurchaseHaveFullCredits( responseCart ) ) {
		return (
			<>
				<div>
					{
						/* translators: %(amount)s is the total amount of credits available in localized currency */
						sprintf( __( 'WordPress.com Credits: %(amount)s available' ), {
							amount: formatCurrency( responseCart.credits_integer, responseCart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						} )
					}
				</div>
			</>
		);
	}

	return <div>{ __( 'Free Purchase' ) }</div>;
}
