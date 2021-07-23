/**
 * External dependencies
 */
import { useMemo } from 'react';
import type { StripeConfiguration, Stripe, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import { createStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-credit-card-method';
import { createStoredCreditCardPaymentMethodStore } from 'calypso/state/partner-portal/payment-methods/';

export function useCreateStoredCreditCard( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	activePayButtonText = undefined,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	activePayButtonText?: string | undefined;
} ): PaymentMethod | null {
	const shouldLoadStripeMethod = ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo( () => createStoredCreditCardPaymentMethodStore(), [] );

	return useMemo(
		() =>
			shouldLoadStripeMethod
				? createStoredCreditCardMethod( {
						store: stripePaymentMethodStore,
						stripe,
						stripeConfiguration,
						activePayButtonText,
				  } )
				: null,
		[
			shouldLoadStripeMethod,
			stripePaymentMethodStore,
			stripe,
			stripeConfiguration,
			activePayButtonText,
		]
	);
}
