import { useStripe } from '@automattic/calypso-stripe';
import {
	isValueTruthy,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
} from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	useCreateCreditCard,
	useCreateExistingCards,
	useCreatePayPalExpress,
	useCreateExistingPayPalPPCP,
} from 'calypso/my-sites/checkout/src/hooks/use-create-payment-methods';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
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
	const { paymentMethods: storedPaypalTokens } = useStoredPaymentMethods( {
		type: 'vault-token',
	} );

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

	const existingPayPalPPCPMethods = useCreateExistingPayPalPPCP( {
		storedPaymentMethods: storedPaypalTokens,
		submitButtonContent: (
			<PaymentMethodSelectorSubmitButtonContent text={ translate( 'Use this PayPal account' ) } />
		),
	} );

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

	const hasExistingPayPalPPCPMethods =
		existingPayPalPPCPMethods && existingPayPalPPCPMethods.length > 0;
	const payPalExpressMethod = useCreatePayPalExpress( {
		shouldShowTaxFields: true,
		labelText:
			currentPaymentMethodId === 'paypal-existing' || hasExistingPayPalPPCPMethods
				? String( translate( 'New PayPal account' ) )
				: String( translate( 'PayPal' ) ),
	} );

	const paymentMethods = useMemo(
		() =>
			[ ...existingCardMethods, ...existingPayPalPPCPMethods, stripeMethod, payPalExpressMethod ]
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
			existingPayPalPPCPMethods,
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
