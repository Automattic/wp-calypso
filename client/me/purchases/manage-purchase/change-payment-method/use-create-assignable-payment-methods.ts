import { useStripe } from '@automattic/calypso-stripe';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	useCreateCreditCard,
	useCreateExistingCards,
	useCreatePayPal,
} from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-methods';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-stored-payment-methods';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import useFetchAvailablePaymentMethods from './use-fetch-available-payment-methods';
import type { PaymentMethod } from '@automattic/composite-checkout';

export default function useCreateAssignablePaymentMethods(
	currentPaymentMethodId: string
): PaymentMethod[] {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError } = useStripe();

	const {
		isFetching: isLoadingAllowedPaymentMethods,
		data: allowedPaymentMethods,
		error: allowedPaymentMethodsError,
	} = useFetchAvailablePaymentMethods();

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: String( translate( 'Save card' ) ),
		allowUseForAllSubscriptions: true,
	} );

	const payPalMethod = useCreatePayPal( {
		shouldShowTaxFields: true,
		labelText:
			currentPaymentMethodId === 'paypal-existing'
				? String( translate( 'New PayPal account' ) )
				: String( translate( 'PayPal' ) ),
	} );

	const { paymentMethods: storedCards } = useStoredPaymentMethods( { type: 'card' } );
	const existingCardMethods = useCreateExistingCards( {
		isStripeLoading,
		stripeLoadingError,
		storedCards,
		activePayButtonText: String( translate( 'Use this card' ) ),
		allowEditingTaxInfo: true,
		isTaxInfoRequired: true,
	} );

	const paymentMethods = useMemo(
		() =>
			[ ...existingCardMethods, stripeMethod, payPalMethod ]
				.filter( isValueTruthy )
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
