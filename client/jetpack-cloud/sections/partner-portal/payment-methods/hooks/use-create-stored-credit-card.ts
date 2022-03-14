import { useMemo } from 'react';
import { createStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-credit-card-method';
import { createStoredCreditCardPaymentMethodStore } from 'calypso/state/partner-portal/credit-card-form';
import type { StripeConfiguration, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export function useCreateStoredCreditCardMethod( {
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

	const store = useMemo( () => createStoredCreditCardPaymentMethodStore(), [] );

	return useMemo(
		() =>
			shouldLoadStripeMethod
				? createStoredCreditCardMethod( {
						store,
						stripe,
						stripeConfiguration,
						activePayButtonText,
				  } )
				: null,
		[ shouldLoadStripeMethod, store, stripe, stripeConfiguration, activePayButtonText ]
	);
}
