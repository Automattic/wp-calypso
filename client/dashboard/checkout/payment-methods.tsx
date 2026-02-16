/**
 * Payment method creation for Dashboard checkout
 */

import { userPaymentMethodsQuery } from '@automattic/api-queries';
import { useStripe } from '@automattic/calypso-stripe';
import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { sprintf, __ } from '@wordpress/i18n';
import { createExistingCardMethod } from '../me/billing-purchases/payment-methods/existing-card-payment-method';
import { existingCardPrefix } from '../me/billing-purchases/payment-methods/use-create-existing-cards';
import { createCreditCardMethod } from './components/credit-card-payment-method';
import { createExistingPayPalPPCPMethod } from './components/existing-paypal-ppcp-payment-method';
import { createPayPalPPCPMethod } from './components/paypal-ppcp-payment-method';
import { createApplePayMethod, createGooglePayMethod } from './components/web-pay-payment-method';
import type {
	StoredPaymentMethod,
	StoredPaymentMethodCard,
	StoredPaymentMethodPayPal,
} from '@automattic/api-core';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

// Akismet Free explicitly prevents showing additional free payment methods.
const PRODUCT_AKISMET_FREE = 'ak_free_yearly';

/**
 * Returns true if the cart total is covered entirely by account credits.
 * Mirrors `doesPurchaseHaveFullCredits` from @automattic/wpcom-checkout.
 */
function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const totalBeforeCredits = cart.sub_total_integer + cart.total_tax_integer;
	return credits > 0 && totalBeforeCredits > 0 && credits >= totalBeforeCredits;
}

function isPaymentMethodACard( method: StoredPaymentMethod ): method is StoredPaymentMethodCard {
	return 'card_last_4' in method;
}

function isPaymentMethodPayPalPPCP(
	method: StoredPaymentMethod
): method is StoredPaymentMethodPayPal {
	return 'payment_partner' in method && method.payment_partner === 'paypal_ppcp';
}

/**
 * Submit button for the free payment method. Mirrors Calypso's FreePurchaseSubmitButton.
 */
function FreePurchaseSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const { formStatus } = useFormStatus();

	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; FreePurchaseSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	const handleButtonPress = () => {
		onClick( {} );
	};

	const getButtonLabel = () => {
		if ( formStatus === FormStatus.SUBMITTING ) {
			return __( 'Processing…' );
		}
		if ( formStatus === FormStatus.READY ) {
			return __( 'Complete checkout' );
		}
		return __( 'Please wait…' );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ getButtonLabel() }
		</Button>
	);
}

/**
 * Label for the free payment method. Mirrors Calypso's WordPressFreePurchaseLabel.
 *
 * Shows one of:
 * - "Assign a payment method later" — for recurring subscriptions with no auto-renewing renewals
 * - "WordPress.com Credits: X available" — when the cart is fully covered by credits
 * - "Free purchase" — otherwise (truly $0 or one-time items)
 */
function FreePurchaseLabel() {
	const { responseCart } = useShoppingCart( undefined );

	const doesCartHaveRenewalWithPaymentMethod = responseCart.products.some(
		( product ) => product.is_renewal_and_will_auto_renew
	);
	const isCartAllOneTimePurchases = responseCart.products.every(
		( product ) => product.is_one_time_purchase
	);
	// Some products (e.g. Akismet Free) explicitly prevent showing additional free methods.
	const isCartAllProductsThatPreventAdditionalFreeMethods = responseCart.products.every(
		( product ) => product.product_slug === PRODUCT_AKISMET_FREE
	);

	if (
		! isCartAllOneTimePurchases &&
		! doesCartHaveRenewalWithPaymentMethod &&
		! isCartAllProductsThatPreventAdditionalFreeMethods
	) {
		return <div>{ __( 'Assign a payment method later' ) }</div>;
	}

	if ( doesPurchaseHaveFullCredits( responseCart ) ) {
		return (
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
		);
	}

	return <div>{ __( 'Free purchase' ) }</div>;
}

/**
 * Inactive (summary) content for the free payment method.
 */
function FreePurchaseSummary() {
	const { responseCart } = useShoppingCart( undefined );

	if ( doesPurchaseHaveFullCredits( responseCart ) ) {
		return (
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
		);
	}

	return <div>{ __( 'Free purchase' ) }</div>;
}

/**
 * Create a free payment method for $0 carts.
 * The label dynamically reads from the cart to show appropriate messaging.
 */
export function createFreeMethod(): PaymentMethod {
	return {
		id: 'free-purchase',
		paymentProcessorId: 'free-purchase',
		label: <FreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <FreePurchaseSummary />,
		getAriaLabel: () => __( 'Free purchase' ),
	};
}

// Re-export for use in index.tsx
export { createCreditCardMethod };

/**
 * Hook to create payment methods for Dashboard checkout.
 *
 * For paid carts: saved cards, Apple/Google Pay, new card, PayPal.
 * For free carts ($0): the same set, plus the free method at the top.
 * The free method lets users skip entering a payment method for non-recurring
 * products or defer adding one for subscriptions ("Assign a payment method later").
 */
export function useCreatePaymentMethods( {
	cartTotal,
	currency,
	siteId = 0,
}: {
	cartTotal: number;
	currency?: string;
	siteId?: number;
} ): PaymentMethod[] {
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();

	// Fetch all saved payment methods in a single query, then filter by type below.
	// Using type: 'all' ensures PayPal PPCP vault tokens are included — they may
	// not be returned by the narrower type: 'agreement' query.
	const { data: allStoredMethods = [] } = useQuery( userPaymentMethodsQuery( { type: 'all' } ) );

	// Existing card payment methods are only available once Stripe has loaded
	// (the processor needs Stripe for 3DS handling).
	const shouldLoadExistingCards = ! isStripeLoading && ! stripeLoadingError;

	const existingCardMethods: PaymentMethod[] = shouldLoadExistingCards
		? allStoredMethods.filter( isPaymentMethodACard ).map( ( card ) =>
				createExistingCardMethod( {
					id: `${ existingCardPrefix }${ card.stored_details_id }`,
					cardholderName: card.name || '',
					cardExpiry: card.expiry,
					brand: card.display_brand ? card.display_brand : card.card_type,
					last4: card.card_last_4,
					storedDetailsId: card.stored_details_id,
					paymentMethodToken: card.mp_ref || '',
					paymentPartnerProcessorId: card.payment_partner || '',
					submitButtonContent: __( 'Pay now' ),
				} )
		  )
		: [];

	const paypalPPCPMethods = allStoredMethods.filter( isPaymentMethodPayPalPPCP ).map( ( method ) =>
		createExistingPayPalPPCPMethod( {
			id: `existing-paypal-ppcp-${ method.stored_details_id }`,
			email: method.email || '',
			storedDetailsId: method.stored_details_id,
			paymentMethodToken: method.mp_ref || '',
			paymentPartnerProcessorId: method.payment_partner,
			submitButtonContent: __( 'Pay now' ),
		} )
	);

	const hasExistingCards = existingCardMethods.length > 0;
	const hasExistingPayPalAccounts = paypalPPCPMethods.length > 0;

	// Web pay methods (Apple Pay / Google Pay) require Stripe to be loaded.
	// They start disabled and are enabled asynchronously once canMakePayment()
	// resolves inside their respective submit button components.
	const shouldLoadWebPay = shouldLoadExistingCards && !! stripe && !! stripeConfiguration;

	const paidMethods: PaymentMethod[] = [
		...existingCardMethods,
		...paypalPPCPMethods,
		...( shouldLoadWebPay ? [ createApplePayMethod( stripe, stripeConfiguration, siteId ) ] : [] ),
		...( shouldLoadWebPay ? [ createGooglePayMethod( stripe, stripeConfiguration, siteId ) ] : [] ),
		createCreditCardMethod( { currency, hasExistingCards } ),
		createPayPalPPCPMethod( { currency, hasExistingPayPalAccounts, siteId } ),
	];

	if ( cartTotal === 0 ) {
		// For free carts, show all payment methods and place the free method last
		// so users are encouraged to add a real payment method for future renewals.
		return [ ...paidMethods, createFreeMethod() ];
	}

	return paidMethods;
}
