import { isDomainTransfer } from '@automattic/calypso-products';
import {
	Button,
	useFormStatus,
	FormStatus,
	useAvailablePaymentMethodIds,
} from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	hasRenewableSubscription,
	hasRenewalItemAndWillAutoRenew,
} from 'calypso/lib/cart-values/cart-items';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import WordPressLogo from '../components/wordpress-logo';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

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
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

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
			<ButtonContents formStatus={ formStatus } responseCart={ responseCart } />
		</Button>
	);
}

function ButtonContents( {
	formStatus,
	responseCart,
}: {
	formStatus: FormStatus;
	responseCart: ResponseCart;
} ) {
	const { __ } = useI18n();

	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}

	if ( formStatus === FormStatus.READY ) {
		if ( doesPurchaseHaveFullCredits( responseCart ) ) {
			const total = formatCurrency(
				responseCart.sub_total_with_taxes_integer,
				responseCart.currency,
				{ isSmallestUnit: true, stripZeros: true }
			);
			/* translators: %s is the total to be paid in localized currency */
			return <>{ sprintf( __( 'Pay %s with credits' ), total ) }</>;
		}
		return <>{ __( 'Complete Checkout' ) }</>;
	}

	return <>{ __( 'Please wait…' ) }</>;
}

function WordPressFreePurchaseLabel() {
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const availablePaymentMethodIds = useAvailablePaymentMethodIds();

	// Domain transfer is a one-time purchase, but it creates a renewable
	// subscription behind the scenes so we'll treat it like a renewable purchase.
	const hasDomainTransfer = responseCart.products.some( ( product ) =>
		isDomainTransfer( product )
	);
	// If the cart has any renewable purchases and there are more
	// than one payment method options, change the label.
	const isRenewableCart = hasRenewableSubscription( responseCart ) || hasDomainTransfer;
	const hasRenewableItemThatWillAutoRenew = hasRenewalItemAndWillAutoRenew( responseCart );
	const freePurchaseLabel =
		isRenewableCart && availablePaymentMethodIds.length > 1 && ! hasRenewableItemThatWillAutoRenew
			? __( 'Assign a Payment Method Later' )
			: __( 'Free Purchase' );

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
			<div>{ freePurchaseLabel }</div>
			<WordPressLogo />
		</>
	);
}

function WordPressFreePurchaseSummary() {
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	if ( doesPurchaseHaveFullCredits( responseCart ) ) {
		return <div>{ __( 'WordPress.com Credits' ) }</div>;
	}

	return <div>{ __( 'Free Purchase' ) }</div>;
}
