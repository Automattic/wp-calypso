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
} from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-methods';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import doesValueExist from 'calypso/my-sites/checkout/composite-checkout/lib/does-value-exist';
import useFetchAvailablePaymentMethods from './use-fetch-available-payment-methods';

export default function useCreateAssignablePaymentMethods(
	currentPaymentMethodId: string
): PaymentMethod[] {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const {
		isFetching: isLoadingAllowedPaymentMethods,
		data: allowedPaymentMethods,
		error: allowedPaymentMethodsError,
	} = useFetchAvailablePaymentMethods();

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: String( translate( 'Save card' ) ),
	} );

	const payPalMethod = useCreatePayPal( {
		labelText:
			currentPaymentMethodId === 'paypal-existing'
				? String( translate( 'New PayPal account' ) )
				: String( translate( 'PayPal' ) ),
	} );

	const storedCards = useSelector( getStoredCards );
	const existingCardMethods = useCreateExistingCards( {
		storedCards,
		activePayButtonText: String( translate( 'Use this card' ) ),
	} );

	const paymentMethods = useMemo(
		() =>
			[ ...existingCardMethods, stripeMethod, payPalMethod ]
				.filter( doesValueExist )
				.filter( ( method ) => {
					// If there's an error fetching allowed payment methods, just allow all of them.
					if ( allowedPaymentMethodsError ) {
						return true;
					}
					const paymentMethodName = translateCheckoutPaymentMethodToWpcomPaymentMethod( method.id );
					return paymentMethodName && allowedPaymentMethods.includes( paymentMethodName );
				} ),
		[
			stripeMethod,
			existingCardMethods,
			payPalMethod,
			allowedPaymentMethods,
			allowedPaymentMethodsError,
		]
	);

	if ( isLoadingAllowedPaymentMethods ) {
		return [];
	}

	return paymentMethods;
}
