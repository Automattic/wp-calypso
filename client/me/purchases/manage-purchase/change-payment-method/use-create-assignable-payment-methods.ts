/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';
import type { PaymentMethod } from '@automattic/composite-checkout';

/**
 * Internal Dependencies
 */
import { getStoredCards } from 'calypso/state/stored-cards/selectors';
import {
	useCreateCreditCard,
	useCreateExistingCards,
	useCreatePayPal,
} from 'calypso/my-sites/checkout/composite-checkout/use-create-payment-methods';

export default function useCreateAssignablePaymentMethods(
	currentPaymentMethodId: string
): PaymentMethod[] {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: translate( 'Save card' ),
	} );

	const payPalMethod = useCreatePayPal( {
		labelText:
			currentPaymentMethodId === 'paypal-existing'
				? translate( 'New PayPal account' )
				: translate( 'PayPal' ),
	} );

	const storedCards = useSelector( getStoredCards );
	const existingCardMethods = useCreateExistingCards( {
		storedCards,
		activePayButtonText: translate( 'Use this card' ),
	} );

	const paymentMethods = useMemo(
		() => [ ...existingCardMethods, stripeMethod, payPalMethod ].filter( Boolean ),
		[ stripeMethod, existingCardMethods, payPalMethod ]
	);

	return paymentMethods;
}
