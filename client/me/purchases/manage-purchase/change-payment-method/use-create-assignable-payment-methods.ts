/**
 * External dependencies
 */
import { useMemo, useState } from 'react';
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
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import doesValueExist from 'calypso/my-sites/checkout/composite-checkout/lib/does-value-exist';

export default function useCreateAssignablePaymentMethods(
	currentPaymentMethodId: string
): PaymentMethod[] {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const allowedPaymentMethods = useFetchAvailablePaymentMethods();
	// TODO: wait for allowedPaymentMethods to be fetched somehow

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
		() =>
			[ ...existingCardMethods, stripeMethod, payPalMethod ]
				.filter( doesValueExist )
				.filter( ( method ) => {
					const paymentMethodName = translateCheckoutPaymentMethodToWpcomPaymentMethod( method.id );
					return paymentMethodName && allowedPaymentMethods.includes( paymentMethodName );
				} ),
		[ stripeMethod, existingCardMethods, payPalMethod, allowedPaymentMethods ]
	);

	return paymentMethods;
}

function useFetchAvailablePaymentMethods(): string[] {
	const [ allowedPaymentMethods ] = useState< string[] >( [] );
	// FIXME: fetch and memoize from /me/allowed-payment-methods
	return allowedPaymentMethods;
}
