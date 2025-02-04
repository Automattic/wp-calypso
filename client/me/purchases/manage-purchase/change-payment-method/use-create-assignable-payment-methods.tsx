import { useStripe } from '@automattic/calypso-stripe';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	useCreateCreditCard,
	useCreateExistingCards,
	useCreatePayPalExpress,
} from 'calypso/my-sites/checkout/src/hooks/use-create-payment-methods';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/src/lib/translate-payment-method-names';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { PaymentMethodSelectorSubmitButtonContent } from '../payment-method-selector/payment-method-selector-submit-button-content';
import useFetchAvailablePaymentMethods from './use-fetch-available-payment-methods';
import type { PaymentMethod } from '@automattic/composite-checkout';

/**
 * Hook to create the payment method objects required by the
 * PaymentMethodSelector for assigning payment methods to existing
 * subscriptions.
 *
 * Payment methods created for checkout use a quite different hook although a
 * similar system.
 */
export default function useCreateAssignablePaymentMethods(
	currentPaymentMethodId: string
): PaymentMethod[] {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError } = useStripe();
	const currency = useSelector( getCurrentUserCurrencyCode );

	const {
		isFetching: isLoadingAllowedPaymentMethods,
		data: allowedPaymentMethods,
		error: allowedPaymentMethodsError,
	} = useFetchAvailablePaymentMethods();

	const { paymentMethods: storedCards } = useStoredPaymentMethods( { type: 'card' } );

	const existingCardMethods = useCreateExistingCards( {
		isStripeLoading,
		stripeLoadingError,
		storedCards,
		submitButtonContent: (
			<PaymentMethodSelectorSubmitButtonContent text={ translate( 'Use this card' ) } />
		),
		allowEditingTaxInfo: true,
		isTaxInfoRequired: true,
	} );
	const hasExistingCardMethods = existingCardMethods && existingCardMethods.length > 0;
	const stripeMethod = useCreateCreditCard( {
		currency,
		isStripeLoading,
		stripeLoadingError,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		submitButtonContent: (
			<PaymentMethodSelectorSubmitButtonContent text={ translate( 'Save card' ) } />
		),
		allowUseForAllSubscriptions: true,
		hasExistingCardMethods,
	} );

	const payPalExpressMethod = useCreatePayPalExpress( {
		shouldShowTaxFields: true,
		labelText:
			currentPaymentMethodId === 'paypal-existing'
				? String( translate( 'New PayPal account' ) )
				: String( translate( 'PayPal' ) ),
	} );

	const paymentMethods = useMemo(
		() =>
			[ ...existingCardMethods, stripeMethod, payPalExpressMethod ]
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
			payPalExpressMethod,
			allowedPaymentMethods,
			allowedPaymentMethodsError,
		]
	);

	if ( isLoadingAllowedPaymentMethods ) {
		return [];
	}

	return paymentMethods;
}
